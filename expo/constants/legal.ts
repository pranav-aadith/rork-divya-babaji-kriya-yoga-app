/**
 * Bundled legal documents shown in the in-app Settings screen.
 * Owner: Divya Babaji Sushumna Kriya Yoga Foundation.
 */

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  updatedAt: string;
  intro: string[];
  sections: LegalSection[];
}

const FOUNDATION = "Divya Babaji Sushumna Kriya Yoga Foundation";
const WEBSITE = "https://divyababajikriyayoga.org";

export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  updatedAt: "September 2026",
  intro: [
    `This Privacy Policy explains how the ${FOUNDATION} ("we", "us", "our") handles information when you use our mobile application (the "App"). Your privacy matters to us, and we have designed the App to collect as little information as possible.`,
  ],
  sections: [
    {
      heading: "1. Who We Are",
      paragraphs: [
        `The ${FOUNDATION} is a spiritual organisation that teaches Sushumna Kriya Yoga and related programmes. This App is operated by the Foundation to share teachings, daily inspiration, event information, and programme details with practitioners and well-wishers.`,
      ],
    },
    {
      heading: "2. Information We Collect",
      paragraphs: [
        "The App does not require you to create an account, and we do not ask you to provide personal information to browse its content.",
        "Information you choose to provide: if you register for a programme, batch, or event through the App, you may be taken to a registration form or a communication channel (such as WhatsApp) operated by the Foundation. Any information you provide there (for example your name, contact number, or your child's details) is given directly by you and handled by the Foundation in connection with that programme.",
        "Content stored on your device: items you mark as favourites (such as saved quotes) are stored only on your own device using local storage. They are not uploaded to us and are not visible to anyone else.",
        "Automatic technical data: like most apps, basic technical information (for example device type and operating system version) may be processed by the underlying platforms and content services solely to deliver content and keep the App working.",
      ],
    },
    {
      heading: "3. How We Use Information",
      paragraphs: [
        "We use the limited information described above to: operate and maintain the App; display teachings, quotes, events, and programme details; process programme registrations you submit; respond to questions or guidance requests you send us; and improve the content and experience of the App.",
        "We do not sell, rent, or trade your personal information.",
      ],
    },
    {
      heading: "4. Children's Privacy",
      paragraphs: [
        "The Foundation runs dedicated programmes for children (for example the Sushumna Sikshana batches for ages 5 to 14). Registration for any children's programme must be completed by a parent or legal guardian.",
        "We do not knowingly collect personal information from children through the App. If you believe a child has provided us with personal information without guardian consent, please contact us and we will promptly delete it.",
      ],
    },
    {
      heading: "5. Third-Party Services",
      paragraphs: [
        "The App links to or displays content from independent services operated by others, including our website, video and audio platforms (such as YouTube and SoundCloud), messaging services (such as WhatsApp), and external registration forms. When you interact with these services, their own privacy policies apply and the Foundation is not responsible for their practices.",
      ],
    },
    {
      heading: "6. Data Storage and Security",
      paragraphs: [
        "Your favourites and app preferences are kept locally on your device. We do not maintain user accounts or databases of app visitors. No method of transmission or storage is completely secure, but because the App stores almost nothing about you, the risks are minimal.",
      ],
    },
    {
      heading: "7. Sharing of Information",
      paragraphs: [
        "We share information only in these limited circumstances: with volunteers or teachers of the Foundation who administer a programme you registered for; with service providers strictly as needed to operate the App; and where disclosure is required by law, regulation, or valid legal process.",
      ],
    },
    {
      heading: "8. Your Rights and Choices",
      paragraphs: [
        "You can remove saved favourites at any time from within the App, and you can delete all locally stored app data by uninstalling the App. To ask about information you provided through a programme registration, or to request access, correction, or deletion of it, please contact us using the details below.",
      ],
    },
    {
      heading: "9. Changes to This Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. The latest version is always available in the App's Settings screen, and the \"Last updated\" date at the top shows when it was most recently revised. Continued use of the App after an update means you accept the revised policy.",
      ],
    },
    {
      heading: "10. Contact Us",
      paragraphs: [
        `If you have questions about this Privacy Policy or how your information is handled, please contact the ${FOUNDATION} through our website (${WEBSITE}) or via the \"Connect with a Guide\" option in the App.`,
      ],
    },
  ],
};

export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  updatedAt: "September 2026",
  intro: [
    `These Terms of Service ("Terms") govern your use of the mobile application operated by the ${FOUNDATION} ("we", "us", "our"). By using the App you agree to these Terms.`,
  ],
  sections: [
    {
      heading: "1. About the App",
      paragraphs: [
        "The App shares the teachings, daily inspiration, programmes, and events of the Foundation, including Sushumna Kriya Meditation. It is offered for personal, non-commercial use.",
      ],
    },
    {
      heading: "2. Acceptance of Terms",
      paragraphs: [
        "By downloading, opening, or using the App, you agree to be bound by these Terms and by our Privacy Policy. If you do not agree, please do not use the App.",
      ],
    },
    {
      heading: "3. Eligibility and Children's Programmes",
      paragraphs: [
        "You may use the App if you are able to form a binding contract or with the involvement and consent of a parent or legal guardian. Registration for any children's programme (such as the Sushumna Sikshana batches) must be completed by the child's parent or legal guardian, who accepts these Terms on the child's behalf.",
      ],
    },
    {
      heading: "4. Intellectual Property",
      paragraphs: [
        `All content in the App — including teachings, texts, quotes, images, audio, video, logos, and the name of the ${FOUNDATION} — is owned by the Foundation or its licensors and is protected by applicable intellectual property laws. You may view and share content for personal, devotional, and non-commercial purposes. You may not copy, modify, distribute, or use the content for commercial purposes without our prior written permission.`,
      ],
    },
    {
      heading: "5. Programme Registrations and Events",
      paragraphs: [
        "Programme and batch registrations made through the App are handled by the Foundation using third-party form services. Submitting a registration form does not guarantee a place in a programme; the Foundation may confirm, reschedule, or cancel programmes at its discretion. Schedules, ages, and languages shown in the App are indicative and may change; the details confirmed at registration will apply.",
      ],
    },
    {
      heading: "6. Third-Party Links and Services",
      paragraphs: [
        "The App may link to external services such as our website, video and audio platforms, and messaging services. These are operated by third parties under their own terms, and we are not responsible for their content, availability, or practices.",
      ],
    },
    {
      heading: "7. Acceptable Use",
      paragraphs: [
        "You agree not to: use the App for any unlawful purpose; interfere with or disrupt the App or its content services; attempt to gain unauthorised access to any systems; or use the App or its content in a way that misrepresents the Foundation or its teachings.",
      ],
    },
    {
      heading: "8. Spiritual Content Disclaimer",
      paragraphs: [
        "The teachings, meditations, and guidance shared in the App are offered for spiritual and personal development. They are not a substitute for professional medical, psychological, or psychiatric advice, diagnosis, or treatment. Always seek the advice of a qualified professional with any questions regarding a medical or mental-health condition, and practise meditation at your own comfort and pace.",
      ],
    },
    {
      heading: "9. Disclaimer of Warranties",
      paragraphs: [
        "The App is provided on an \"as is\" and \"as available\" basis. To the fullest extent permitted by law, the Foundation disclaims all warranties, express or implied, including fitness for a particular purpose and non-infringement. We do not warrant that the App will be uninterrupted or error-free.",
      ],
    },
    {
      heading: "10. Limitation of Liability",
      paragraphs: [
        "To the fullest extent permitted by law, the Foundation, its trustees, teachers, and volunteers will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data or profits, arising from your use of or inability to use the App or its content.",
      ],
    },
    {
      heading: "11. Changes to the App and These Terms",
      paragraphs: [
        "We may update, add, or remove features and content, and may revise these Terms from time to time. The latest version is always available in the App's Settings screen. Continued use of the App after changes are posted constitutes acceptance of the revised Terms.",
      ],
    },
    {
      heading: "12. Governing Law",
      paragraphs: [
        "These Terms are governed by the laws of India, and any disputes relating to the App or these Terms will be subject to the exclusive jurisdiction of the courts at the location where the Foundation is headquartered.",
      ],
    },
    {
      heading: "13. Contact Us",
      paragraphs: [
        `Questions about these Terms can be directed to the ${FOUNDATION} through our website (${WEBSITE}) or via the \"Connect with a Guide\" option in the App.`,
      ],
    },
  ],
};

/** Legal documents by slug, as used by the Settings screen routes. */
export const LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  "privacy-policy": PRIVACY_POLICY,
  "terms-of-service": TERMS_OF_SERVICE,
};
