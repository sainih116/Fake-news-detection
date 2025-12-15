import React from 'react';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { EmailIcon } from './icons/EmailIcon';
import { PhoneIcon } from './icons/PhoneIcon';

const ContactInfoRow: React.FC<{
  icon: React.ReactNode;
  href: string;
  text: string;
  ariaLabel: string;
}> = ({ icon, href, text, ariaLabel }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    className="flex items-center space-x-3 text-gray-600 hover:text-green-700 hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
  >
    <div className="flex-shrink-0 w-6 h-6">{icon}</div>
    <span className="font-medium">{text}</span>
  </a>
);

export const Contact: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Contact & Credits</h2>
      <p className="text-gray-500 mb-4">
        Developed by <span className="font-semibold">Harshit Saini</span>
      </p>
      <div className="space-y-2">
        <ContactInfoRow
          icon={<LinkedInIcon />}
          href="https://www.linkedin.com/in/harshit-saini-272107235?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BkoU8bd3YRsexoASybvcfmA%3D%3D"
          text="LinkedIn Profile"
          ariaLabel="View Harshit Saini's LinkedIn Profile"
        />
        <ContactInfoRow
          icon={<EmailIcon />}
          href="mailto:sainih116@gmail.com"
          text="sainih116@gmail.com"
          ariaLabel="Send an email to Harshit Saini"
        />
        <ContactInfoRow
          icon={<PhoneIcon />}
          href="tel:+918006262813"
          text="+91 80062 62813"
          ariaLabel="Call Harshit Saini"
        />
      </div>
    </div>
  );
};