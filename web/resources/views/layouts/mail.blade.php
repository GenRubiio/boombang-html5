<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" style="height: 100%;width: 100%;overflow-x: hidden;font-size: 62.5%;">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>{{env('APP_NAME')}}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="author" content="BoomMania">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
</head>
<body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0"
      style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;color: #414140;background: #f2f2f2;height: 100% !important;width: 100% !important;">
<center>
    <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable"
           style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin: 0;padding: 0;color: #333;background: #e1e1e1;border-collapse: collapse !important;height: 100% !important;width: 100% !important;">
        <tr>
            <td align="center" valign="top" id="bodyCell"
                style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin: 0;padding: 20px;border-top: 4px solid transparent;height: 100% !important;width: 100% !important;">
                <!-- BEGIN TEMPLATE // -->
                <table border="0" cellpadding="0" cellspacing="0" id="templateContainer"
                       style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;width: 600px;border: 1px solid transparent;border-top: .5rem solid #444444;border-collapse: collapse !important;">
                    <tr>
                        <td align="center" valign="top"
                            style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;">
                            <!-- BEGIN LOGO // -->
                        @include('emails.partials.header')
                        <!-- // END LOGO -->
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top"
                            style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;">
                            <!-- BEGIN BODY // -->
                        @section('body')
                        @show
                        <!-- // END BODY -->
                        </td>
                    </tr>
                    <tr>
                        <td align="center" valign="top"
                            style="-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;">
                            <!-- BEGIN FOOTER // -->
                        @include('emails/partials/footer')
                        <!-- // END FOOTER -->
                        </td>
                    </tr>
                </table>
                <!-- // END TEMPLATE -->
            </td>
        </tr>
    </table>
</center>
</body>
</html>
