import csv
import os
from datetime import datetime

import boto3

TABLE_NAME = os.getenv('AI_WORKSTACK_TABLE', 'ai-workstack-tickets')
REGION = os.getenv('AWS_REGION', 'us-east-1')
CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'ai workstack.csv')


def parse_uk_date(value: str) -> str:
    if not value:
        return ''
    value = value.strip()
    if not value:
        return ''
    try:
        return datetime.strptime(value, '%d/%m/%Y').strftime('%Y-%m-%d')
    except ValueError:
        return ''


def map_status(status: str) -> str:
    if status == 'POC In-Flight':
        return 'POC In Flight'
    if status == 'Engineering - In Progress':
        return 'In Progress'
    return status or 'New Request'


def split_assignees(raw_owner: str):
    if not raw_owner:
        return ['Unassigned']

    normalized = raw_owner.replace('&', ',').replace('/', ',').replace(' and ', ',')
    names = [name.strip() for name in normalized.split(',') if name.strip()]

    # Historical cleanup requested by user.
    names = ['Steve' if name == 'Steve O' else name for name in names]
    return names or ['Unassigned']


def get_business_day_count(start_date: str, end_date: str) -> int:
    if not start_date or not end_date:
        return 0
    try:
        start = datetime.strptime(start_date, '%Y-%m-%d').date()
        end = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return 0

    if end < start:
        return 0

    count = 0
    current = start
    while current <= end:
        if current.weekday() < 5:
            count += 1
        current = current.fromordinal(current.toordinal() + 1)
    return count


def get_tshirt_size(start_date: str, end_date: str) -> str:
    days = get_business_day_count(start_date, end_date)
    if days < 1:
        return 'XS'
    if days <= 4:
        return 'S'
    if days <= 10:
        return 'M'
    if days <= 20:
        return 'L'
    return 'XL'


def build_items_from_csv(file_path: str):
    items = []
    with open(file_path, mode='r', encoding='utf-8-sig', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for idx, row in enumerate(reader, start=1):
            raw_project = (row.get('App / Project') or '').strip()
            is_tbc_project = (not raw_project) or raw_project.upper() == 'TBC'
            project = '' if is_tbc_project else raw_project
            title = (row.get('Task') or '').strip() or f'Ticket {idx}'
            description = (row.get('Description') or '').strip() or 'No description provided.'
            status = 'New Request' if is_tbc_project else map_status((row.get('Status') or '').strip())
            start_date = parse_uk_date((row.get('start date') or '').strip())
            end_date = parse_uk_date((row.get('end date') or '').strip())
            who = (row.get('Who') or '').strip()
            assignees = ['Unassigned'] if status == 'New Request' else split_assignees(who)
            tshirt = get_tshirt_size(start_date, end_date)

            items.append(
                {
                    'id': f'csv-{idx}',
                    'Ref': f'AI-{idx:03d}',
                    'Type': 'POC',
                    'Title': title,
                    'AssignedTo': ', '.join(assignees),
                    'StartDate': start_date,
                    'EndDate': end_date,
                    'Capacity': 0 if status == 'New Request' else 50,
                    'Status': status,
                    'Priority': 'Unprioritised' if status == 'New Request' else 'Medium',
                    'RaisedBy': assignees[0],
                    'DateAdded': start_date or datetime.utcnow().strftime('%Y-%m-%d'),
                    'Description': description,
                    'BusinessValue': f'{project} program' if project else 'New request backlog',
                    'TShirt': tshirt,
                    'Project': project,
                    'NotesHistory': [],
                }
            )

    return items


def clear_table(table):
    deleted = 0
    scan_kwargs = {'ProjectionExpression': 'id'}

    while True:
        response = table.scan(**scan_kwargs)
        items = response.get('Items', [])

        if items:
            with table.batch_writer() as batch:
                for item in items:
                    batch.delete_item(Key={'id': item['id']})
                    deleted += 1

        last_key = response.get('LastEvaluatedKey')
        if not last_key:
            break
        scan_kwargs['ExclusiveStartKey'] = last_key

    return deleted


def load_items(table, items):
    with table.batch_writer() as batch:
        for item in items:
            batch.put_item(Item=item)


def main():
    csv_path = os.path.abspath(CSV_FILE_PATH)
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f'CSV not found: {csv_path}')

    dynamodb = boto3.resource('dynamodb', region_name=REGION)
    table = dynamodb.Table(TABLE_NAME)

    print(f'Reading CSV: {csv_path}')
    items = build_items_from_csv(csv_path)
    print(f'Parsed rows: {len(items)}')

    print(f'Clearing DynamoDB table: {TABLE_NAME}')
    deleted_count = clear_table(table)
    print(f'Deleted items: {deleted_count}')

    print('Loading new items from CSV...')
    load_items(table, items)
    print(f'Inserted items: {len(items)}')
    print('DynamoDB reload complete.')


if __name__ == '__main__':
    main()
