import { SQSServiceException } from "@aws-sdk/client-sqs";
import { config } from "../../../config/env";
import { ICourseInformation, IEmailParams } from "../../../../types";
import { sqs } from "..";
import ExternalError from "../../../helpers/errorHandlers/External/externalErrors";

const reasonMapper: Record<string, string> = {
  cc_rejected_insufficient_amount: "Fondos insuficientes",
  cc_rejected_bad_filled_security_code: "Código de seguridad inválido",
  cc_rejected_bad_filled_date: "Problema con fecha de vencimiento",
};

const introLink =
  config.NODE_ENV === "prod"
    ? "https://pledu.plataforma5.la/curso-introductorio---front-end/00--bienvenida/acerca-del-curso-d4718f7d"
    : "https://pledu-dev.plataforma5.la/curso-introductorio---front-end/00--bienvenida/acerca-del-curso-d4718f7d";

const introATRLandingLink =
  config.NODE_ENV === "prod"
    ? "https://www.plataforma5.la/aplica/intro/formulario?modalidad=atr"
    : "https://dev.plataforma5.la/aplica/intro/formulario?modalidad=atr";

const introLiveLandingLink =
  config.NODE_ENV === "prod"
    ? "https://www.plataforma5.la/aplica/intro/fechas?modalidad=videoconferencia"
    : "https://dev.plataforma5.la/aplica/intro/fechas?modalidad=videoconferencia";

const { EMAIL_QUEUE_URL } = config;

class SQSEmailRepository {
  public static enqueue = new SQSEmailRepository();

  public async email(emailParams: Partial<IEmailParams>) {
    try {
      const params = {
        MessageBody: JSON.stringify(emailParams),
        QueueUrl: EMAIL_QUEUE_URL,
      };

      return await sqs.sendMessage(params);
    } catch (error) {
      throw new ExternalError("sqs_error", error as SQSServiceException);
    }
  }

  public async pendingPaymentEmail(mailParams: {
    modality: string;
    price: number | string;
    recipientEmail: string;
  }) {
    const { modality, price, recipientEmail } = mailParams;
    return this.email({
      modality,
      price,
      recipientEmail,
      template: "intro_payment_process",
    });
  }

  public async confirmedATRIntroEmail(mailParams: { recipientEmail: string }) {
    const { recipientEmail } = mailParams;
    return this.email({
      recipientEmail,
      template: "intro_atr",
    });
  }

  public async confirmedLiveIntroEmail(mailParams: {
    course: ICourseInformation;
    recipientEmail: string;
  }) {
    const { course, recipientEmail } = mailParams;
    course.link = introLink;
    return this.email({
      course,
      recipientEmail,
      template: "intro_live",
    });
  }

  public async confirmedLiveIntroPaymentEmail(mailParams: {
    course: ICourseInformation;
    recipientEmail: string;
  }) {
    const { course, recipientEmail } = mailParams;
    course.link = introLink;
    return this.email({
      course,
      recipientEmail,
      template: "intro_payment_approved_wTeacher",
    });
  }

  public async confirmedATRPaymentEmail(mailParams: {
    recipientEmail: string;
  }) {
    const { recipientEmail } = mailParams;
    return this.email({
      link: introLink,
      recipientEmail,
      template: "intro_payment_approved_atr",
    });
  }

  public async rejectedPaymentEmail(mailParams: {
    recipientEmail: string;
    reason: string;
    modality: string;
    price: number | string;
  }) {
    const { reason, modality, price, recipientEmail } = mailParams;
    const link = modality.includes("ATR")
      ? introATRLandingLink
      : introLiveLandingLink;
    return this.email({
      link,
      reason: reasonMapper[reason]
        ? reasonMapper[reason]
        : "Error al procesar tu pago",
      modality,
      price,
      recipientEmail,
      template: "intro_payment_rejected",
    });
  }

  public async activateAccount(mailParams: {
    recipientEmail: string;
    token: string;
  }) {
    const { recipientEmail, token } = mailParams;
    return this.email({
      token,
      recipientEmail,
      template: "pledu_activate_account",
    });
  }
}

export default SQSEmailRepository;
