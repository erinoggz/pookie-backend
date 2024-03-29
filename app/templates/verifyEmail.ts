const verifyEmail = (otp: number): string => {
  const html = `
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tbody>
    <tr>
      <td width="100%">
        <div style="max-width: 600px; margin: 0 auto">
          <table align="center" cellpadding="0" cellspacing="0" style="
                                      border-spacing: 0;
                                      font-family: gt-eesti, ArialMT, Helvetica, Arial, sans-serif;
                                      margin: 0 auto;
                                      padding: 45px;
                                      width: 100%;
                                      max-width: 500px;
                                      background-color: #07354d;
                                    ">
            <tbody>
              <tr>
                <td>
                  <table style="margin-bottom: 40px; width: 100%" width="100%">
                    <tbody>
                      <tr>
                        <td>
                          <svg>
                            <!-- here -->
                          </svg>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="text-align: justify; word-break: break-word">
                  <table style="margin-bottom: 20px; width: 100%" width="100%">
                    <tbody>
                      <tr>
                        <td>
                          <table style="width: 100%; margin-bottom: 20px" width="100%" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                <td>
                                  <strong style="
                                      font-family: Helvetica, Arial, sans-serif;
                                      color: white;
                                    ">Welcome to Pookie 🎉</strong>
                                  <p style="
                                      font-size: 16px;
                                      line-height: 30px;
                                      color: #dfe2e7;
                                      word-break: normal;
                                    ">
                                    Hi
                                  </p>
                                  <p style="
                                      font-size: 16px;
                                      line-height: 30px;
                                      color: #dfe2e7;
                                      word-break: normal;
                                      width: 450px;
                                    ">
                                    You have requested to join us at Pookie. Please
                                    use the 6-digit OTP code to activate your
                                    account. Please note OTP expires in 5 minutes
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <center>
                            <table style="
                                                                                                                    background-color: #07354d;
                                                                                                                    margin-bottom: 20px;
                                                                                                                    table-layout: fixed;
                                                                                                                  "
                              align="center" width="" cellspacing="0" cellpadding="0">
                              <tbody>
                                <tr>
                                  <td style="
                                                                                                                                            background-color: #1686c1;
                                                                                                                                            color: #fff;
                                                                                                                                            text-align: center;
                                                                                                                                            border-radius: 16px;
                                                                                                                                            padding: 16px 24px;
                                                                                                                                            border-color: transparent;
                                                                                                                                            font-weight: bold;
                                      font-size: 16px;
                                      line-height: 1;
                                      width: 133px;
                                    ">
                                    <a style="color: white; text-decoration: none" href="#">
                                      ${otp}
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </center>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table style="width: 100%; margin-bottom: 20px" width="100%" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                <td>
                                  <p
                                    style="
                                                                                                                                                                                                                                            font-size: 16px;
                                                                                                                                                                                                                                            line-height: 30px;
                                                                                                                                                                                                                                            color: #dfe2e7;
                                                                                                                                                                                                                                            word-break: normal;
                                                                                                                                                                                                                                          ">
                                    If you did not initiate this request, please
                                    contact us immediately at
                                    <a href="https://pookieapp.ie/#contact" style="color: #17e9c2">https://pookieapp.ie.</a>
                                  </p>
                                  <p
                                    style="
                                                                                                                                                                                                                                            font-size: 16px;
                                                                                                                                                                                                                                            line-height: 30px;
                                                                                                                                                                                                                                            color: #dfe2e7;
                                                                                                                                                                                                                                            word-break: normal;
                                                                                                                                                                                                                                          ">
                                    Pookie Team
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td></td>
              </tr>
              <tr>
                <td style="text-align: center">
                  <table style="
                      max-width: 100%;
                      width: 100%;
                      text-align: center;
                      font-family: ArialMT, Arial, sans-serif;
                    " cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td style="text-align: center">
                          <p style="
                                                                                font-size: 14px;
                                                                                color: #a0a7b6;
                                                                                text-align: center;
                                                                                padding: 0;
                                                                                margin-top: 5px;
                                                                                margin-bottom: 2px;
                                                                            ">
                            This email was sent to you by Pookie
                          </p>
                          <p style="
                              font-size: 14px;
                              color: #a0a7b6;
                              text-align: center;
                              padding: 0;
                              margin-top: 5px;
                              margin-bottom: 20px;
                            ">
                            (Do not reply)
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  </tbody>
</table>`;
  return html;
};

export default verifyEmail;
