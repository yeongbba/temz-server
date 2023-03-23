import crypto from 'crypto';
import axios from 'axios';
import { config } from '../config';

const SENS_REQUEST_URL = `https://sens.apigw.ntruss.com/sms/v2/services/${config.sens.serviceId}/messages`;
const DEFAULT_BODY = {
  type: 'SMS',
  contentType: 'COMM',
  countryCode: '82',
  content: 'default',
};

export async function sendSMSMessage(data) {
  data = { ...DEFAULT_BODY, ...data };
  const sensAuth = prepareSensAuthData();
  await axios(SENS_REQUEST_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-ncp-apigw-timestamp': sensAuth.timestamp,
      'x-ncp-iam-access-key': sensAuth.accessKey,
      'x-ncp-apigw-signature-v2': sensAuth.signature,
    },
    data: JSON.stringify(data),
  });
}

function prepareSensAuthData() {
  const space = ' ';
  const newLine = '\n';
  const method = 'POST';
  const url = `/sms/v2/services/${config.sens.serviceId}/messages`;
  const timestamp = new Date().getTime().toString();

  const accessKey = config.sens.accessKey;
  const secretKey = config.sens.secretKey;
  const hmac = method + space + url + newLine + timestamp + newLine + accessKey;
  const signature = crypto.createHmac('sha256', secretKey).update(hmac).digest('base64');

  return {
    timestamp,
    accessKey,
    signature,
  };
}
