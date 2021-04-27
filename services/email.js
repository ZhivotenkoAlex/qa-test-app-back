const Mailgen = require("mailgen");
const sgMail = require("@sendgrid/mail");

require("dotenv").config();

class EmailService {
  #sender = sgMail;
  #GenerateTemplate = Mailgen;

  #createTemplate(verificationToken) {
    const mailGenerator = new this.#GenerateTemplate({
      theme: "default",
      product: {
        name: "QA testing",
        link: process.env.FRONTEND_URL,
        // logo: "https://qa-testing.netlify.app/",
      },
    });

    const template = {
      body: {
        name: "New user",
        intro:
          "Welcome to  QA testing application! We're very excited to have you on board.",
        action: {
          instructions: "To get started, please click here:",
          button: {
            color: "#ff6b09",
            text: "Confirm your account",
            link: `${process.env.FRONTEND_URL}/verify?verificationToken=${verificationToken}`,
          },
        },
        outro: "Just do it.",
      },
    };

    return mailGenerator.generate(template);
  }

  async sendEmail(verificationToken, email) {
    const emailBody = this.#createTemplate(verificationToken);

    this.#sender.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: "alex.fedorkan@gmail.com",
      subject: "Email verification",
      html: emailBody,
    };
    await this.#sender.send(msg);
  }
}

module.exports = EmailService;
