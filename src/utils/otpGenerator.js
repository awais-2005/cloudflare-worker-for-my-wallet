export function otpGenerator(length) {
    let num = Math.pow(10, length);
    let otp = Math.floor(Math.random() * num);
    if (otp < (num / 10)) {
        return "0" + otp;
    }
    return "" + otp;
}