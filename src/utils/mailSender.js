import nodemailer from "nodemailer";



class NodeMailSender {
    constructor() {
        this.transporter = nodemailer.createTransport(
            {
                service: "gmail",
                auth: {
                    user: "saarock200@gmail.com",
                    pass: "vnrb fipf zwhu byqs"
                }
            }
        );
    }

    async send(from, to, subject, text) {
        try {
        
            const options = {
                from,
                to,
                subject,
                text
            }

            await this.transporter.sendMail(options, function (error, info) {
                if (error) {
                    console.log("failed")
                    return {
                        type: false,
                        message: "Fail to send the mail",
                    }
                } else {
                    console.log("Mail send succes")
                    return {
                        type: true,
                        message: "send successfully",
                    }
                }
            });

        } catch (error) {
            console.log("Failed and catch by the catch: ", error.message)
            throw new Error(error.message);
        }
    }
}

const nodeMailer = new NodeMailSender();


export default nodeMailer;