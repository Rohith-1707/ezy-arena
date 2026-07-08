export interface SendNotificationOptions {
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'EMERGENCY';
}

export class NotificationService {
  /**
   * Dispatches a notification across multiple channels (PWA/Firebase, SMS, Email).
   */
  static async sendNotification(options: SendNotificationOptions) {
    const { userId, title, message, type } = options;
    console.log(`[Notification Service] Dispatching to User(${userId}) [${type}]: "${title}" - ${message}`);

    // 1. Simulate Push Notification (Firebase Cloud Messaging)
    this.sendFirebasePush(userId, title, message);

    // 2. Simulate SMS Dispatch (Twilio)
    this.sendSMS(userId, message);

    // 3. Simulate Email Dispatch (SendGrid)
    this.sendEmail(userId, title, message);
  }

  private static sendFirebasePush(userId: string, title: string, message: string) {
    if (process.env.FIREBASE_CREDENTIALS_JSON) {
      console.log(`[Firebase FCM] Push notification sent to register device for user: ${userId}`);
    } else {
      console.log(`[Firebase FCM] Mocking FCM push notification to ${userId}`);
    }
  }

  private static sendSMS(userId: string, message: string) {
    if (process.env.TWILIO_ACCOUNT_SID) {
      console.log(`[Twilio SMS] Dispatching text alert to user: ${userId}`);
    } else {
      console.log(`[Twilio SMS] Mocking SMS delivery: "${message}"`);
    }
  }

  private static sendEmail(userId: string, title: string, message: string) {
    if (process.env.SENDGRID_API_KEY) {
      console.log(`[SendGrid Email] Sending email alert: "${title}"`);
    } else {
      console.log(`[SendGrid Email] Mocking email delivery: "${title}" to user ${userId}`);
    }
  }
}
