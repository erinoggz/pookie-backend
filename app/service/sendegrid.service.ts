// import config from '../config/config';
// import sgMail from '@sendgrid/mail';
// import * as path from 'path';
// import * as ejs from 'ejs';
// import { IEmail } from '../common/Types/email';
// import Helpers from '../lib/helpers';
// import StatusCodes from '../lib/response/status-codes';
// import { ErrnoException } from '../common/Interface/IResponse';
// sgMail.setApiKey(config.sendgrid.sendgrid_api_key);

// export class EmailService {
//   sendEmail = async (emailProp: IEmail): Promise<true | ErrnoException> => {
//     try {
//       const template = await ejs.renderFile(
//         path.join(__dirname, `../templates/${emailProp.template_name}.ejs`),
//         {
//           email: emailProp.recipient_email,
//           action_url: emailProp.action_url,
//           email_data: emailProp.email_data,
//         }
//       );
//       if (!template) throw new Error('Template does not exist!');

//       const emailData = {
//         from: config.sendgrid.email_from,
//         to: emailProp.recipient_email || null,
//         subject: `${emailProp.subject}` || 'Welcome',
//         html: template,
//       };

//       const send = await sgMail.send(emailData);
//       if (!send) {
//         throw new Error(
//           'Unable to send emails at this time. Please try again later'
//         );
//       }
//       return true;
//     } catch (error) {
//       return Helpers.CustomException(
//         StatusCodes.UNPROCESSABLE_ENTITY,
//         error?.message
//       );
//     }
//   };
// }
