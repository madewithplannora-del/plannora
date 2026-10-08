function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getOtpMsg(otp) {
    return {
        text: `Your Plannora verification OTP is ${otp}. It is valid for 10 minutes. Do not share this OTP with anyone.`,

        html: `

<!DOCTYPE html>

<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light only">

<title>Your Plannora verification code</title>
</head>

<body style="margin:0;padding:0;background-color:#FFFFFF;">

<table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    bgcolor="#FFFFFF"
    style="background-color:#FFFFFF;"
>
<tr>

<td
    align="center"
    style="padding:40px 16px;"
>

<table
    role="presentation"
    width="520"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="width:100%;max-width:520px;"
>

<!-- =========================
     BRAND
========================= -->

<tr>

<td
    style="
        padding:0 4px 22px;
        font-family:Georgia,'Times New Roman',serif;
        font-size:26px;
        font-weight:bold;
        color:#12324D;
    "
>
    Plannora
</td>

</tr>

<!-- =========================
     MAIN PANEL
========================= -->

<tr>

<td
    bgcolor="#FFFFFF"
    style="
        background-color:#FFFFFF;
        border-radius:24px;
        border:1px solid #DCEAF4;
        padding:36px 36px 36px;
    "
>

<!-- =========================
     IMPORTANT SECURITY WARNING
     MOVED TO TOP
========================= -->

<table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="margin-bottom:26px;"
>

<tr>

<td
    bgcolor="#FFF4F4"
    style="
        background-color:#FFF4F4;
        border:1px solid #F1CACA;
        border-radius:14px;
        padding:16px 18px;
    "
>

<table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<!-- WARNING ICON -->

<td
    valign="top"
    width="30"
    style="
        font-family:Arial,sans-serif;
        font-size:20px;
        line-height:1;
        color:#C62828;
        padding-right:8px;
    "
>
    ⚠
</td>

<!-- WARNING TEXT -->

<td
    valign="top"
    style="
        font-family:Verdana,Geneva,Tahoma,sans-serif;
    "
>

<div
    style="
        font-size:13px;
        line-height:1.5;
        font-weight:bold;
        color:#A61B1B;
        margin-bottom:4px;
    "
>
    Keep your verification code private
</div>

<div
    style="
        font-size:12px;
        line-height:1.6;
        color:#7A4545;
    "
>
    Plannora will never ask you for this code by
    phone, chat, or email. If someone asks for it,
    do not share it.
</div>

</td>

</tr>

</table>

</td>

</tr>

</table>

<!-- =========================
     TITLE
========================= -->

<h1
    style="
        margin:0 0 14px;
        font-family:Georgia,'Times New Roman',serif;
        font-size:28px;
        line-height:1.25;
        font-weight:bold;
        color:#12324D;
    "
>
    Confirm your email address
</h1>

<!-- =========================
     DESCRIPTION
========================= -->

<p
    style="
        margin:0 0 28px;
        font-family:Verdana,Geneva,Tahoma,sans-serif;
        font-size:15px;
        line-height:1.7;
        color:#4A6070;
    "
>
    Enter this code in Plannora to finish signing up.
    It works once and expires in 10 minutes.
</p>

<!-- =========================
     OTP
========================= -->

<table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
>

<tr>

<td
    align="center"
    bgcolor="#A7F0D2"
    style="
        background-color:#A7F0D2;
        border-radius:18px;
        padding:22px 10px;
        -webkit-user-select:all;
        user-select:all;
        font-family:Georgia,'Times New Roman',serif;
        font-size:42px;
        line-height:1;
        font-weight:bold;
        letter-spacing:12px;
        color:#12324D;
    "
>
    ${otp}
</td>

</tr>

</table>

<!-- =========================
     COPY MESSAGE
========================= -->

<p
    style="
        margin:12px 0 0;
        font-family:Verdana,Geneva,Tahoma,sans-serif;
        font-size:12px;
        line-height:1.6;
        color:#6B8294;
        text-align:center;
    "
>
    Tap and hold the code to copy it.
</p>

<!-- =========================
     TRUST MESSAGE
========================= -->

<p
    style="
        margin:20px 0 0;
        padding-top:20px;
        border-top:1px solid #DCEAF4;
        font-family:Verdana,Geneva,Tahoma,sans-serif;
        font-size:12px;
        line-height:1.7;
        color:#6B8294;
        text-align:center;
    "
>
    Didn't request this code?
    You can safely ignore this email.
</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>
</html>

        `
    };
}

module.exports = {
    generateOtp,
    getOtpMsg
};