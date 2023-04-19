/** @format */

export type IEmail = {
  subject: string;
  template_name: string;
  recipient_email: string;
  short_response_message: string;
  action_url?: string;
  email_data?: string | Array<object> | object;
};
