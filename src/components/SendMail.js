import emailjs from "@emailjs/browser";
// Initialize with your public key
emailjs.init("JqKWavpl8uMQG-ob_");
export const sendTableEmail = async (recipient, message) => {
 
  try {
    await emailjs.send("service_8zpmxjf", "template_cchz1mf", {
      to_email: recipient,
      subject: "Availability request",
      message_html: message,
    });
    // console.log(htmlTable)
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
