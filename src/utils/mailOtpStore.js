import HashMap from "./hashNode.js";

class MailOtpStore {

    constructor() {
        this.hashMap = new HashMap();
    }

    generateOtp() {
        const otp = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
        return otp;
    }

    storeOtp(email, otp) {
        this.hashMap.set(email, otp);
        return otp;
    }

    deleteOtp(email) {
        this.hashMap.delete(email);
    }

    verifyOtp(email, otp) {
        const savedOtp = this.hashMap.exist(email);
        if (savedOtp) {
            this.deleteOtp(email);
            return true;
        } else {
            return false;
        }

    }
}

const mailOtpStore = new MailOtpStore();
export default mailOtpStore;