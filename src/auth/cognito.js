import { AuthenticationDetails, CognitoUser, CognitoUserPool } from 'amazon-cognito-identity-js';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

const isConfigured = Boolean(userPoolId && clientId);
const userPool = isConfigured
  ? new CognitoUserPool({
      UserPoolId: userPoolId,
      ClientId: clientId,
    })
  : null;

const toUserProfile = (username, attributes = []) => {
  const map = Object.fromEntries(attributes.map((item) => [item.Name, item.Value]));
  return {
    username,
    email: map.email || username,
    name: map.name || map.email || username,
  };
};

const getCognitoUser = (username) => {
  if (!userPool) {
    throw new Error('Cognito is not configured for this environment.');
  }

  return new CognitoUser({
    Username: username,
    Pool: userPool,
  });
};

export const authConfig = {
  isConfigured,
  userPoolId,
  clientId,
};

export const getCurrentSession = () =>
  new Promise((resolve, reject) => {
    if (!userPool) {
      resolve(null);
      return;
    }

    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession((sessionError, session) => {
      if (sessionError || !session?.isValid()) {
        reject(sessionError || new Error('Invalid Cognito session.'));
        return;
      }

      currentUser.getUserAttributes((attributesError, attributes) => {
        if (attributesError) {
          reject(attributesError);
          return;
        }

        resolve({
          user: currentUser,
          profile: toUserProfile(currentUser.getUsername(), attributes || []),
          session,
        });
      });
    });
  });

export const signIn = (username, password) =>
  new Promise((resolve, reject) => {
    const cognitoUser = getCognitoUser(username.trim());
    cognitoUser.setAuthenticationFlowType('USER_PASSWORD_AUTH');
    const authDetails = new AuthenticationDetails({
      Username: username.trim(),
      Password: password,
    });

    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        cognitoUser.getUserAttributes((attributesError, attributes) => {
          if (attributesError) {
            reject(attributesError);
            return;
          }

          resolve({
            type: 'authenticated',
            user: cognitoUser,
            profile: toUserProfile(cognitoUser.getUsername(), attributes || []),
            session,
          });
        });
      },
      onFailure: (error) => reject(error),
      newPasswordRequired: (userAttributes) => {
        const sanitized = { ...userAttributes };
        delete sanitized.email;
        delete sanitized.email_verified;
        delete sanitized.name;

        resolve({
          type: 'new-password-required',
          user: cognitoUser,
          profile: toUserProfile(cognitoUser.getUsername(), [
            { Name: 'email', Value: sanitized.email || username.trim() },
            { Name: 'name', Value: sanitized.name || username.trim() },
          ]),
          userAttributes: sanitized,
        });
      },
    });
  });

export const completeNewPassword = (cognitoUser, newPassword, userAttributes = {}) =>
  new Promise((resolve, reject) => {
    cognitoUser.completeNewPasswordChallenge(newPassword, userAttributes, {
      onSuccess: (session) => {
        cognitoUser.getUserAttributes((attributesError, attributes) => {
          if (attributesError) {
            reject(attributesError);
            return;
          }

          resolve({
            type: 'authenticated',
            user: cognitoUser,
            profile: toUserProfile(cognitoUser.getUsername(), attributes || []),
            session,
          });
        });
      },
      onFailure: (error) => reject(error),
    });
  });

export const signOut = () => {
  if (!userPool) {
    return;
  }

  const currentUser = userPool.getCurrentUser();
  currentUser?.signOut();
};
