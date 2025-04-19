import jwt from "jsonwebtoken";

export const sendToken = async (user: any) => {
  try {
    const accessToken = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.ACCESS_TOKEN || 'key', { expiresIn: '40m' });
    const refreshToken = jwt.sign({ user_id: user.user_id, role: user.role }, process.env.REFRESH_TOKEN || 'key', { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };

  } catch (error) {
    return error
  }
};

export const sendTokenCMSUser = async (user: any) => {
  try {
    const accessToken = jwt.sign({ user_id: user.cms_user_id, role: user.role }, process.env.ACCESS_TOKEN || 'key', { expiresIn: '1d' });
    const refreshToken = jwt.sign({ user_id: user.cms_user_id, role: user.role }, process.env.REFRESH_TOKEN || 'key', { expiresIn: '7d' });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  } catch (error) {
    return error
  }
};