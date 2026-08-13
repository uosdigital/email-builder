# Email Builder

A powerful drag-and-drop email template builder with real-time preview and test email functionality.

## Features

- **Drag & Drop Interface**: Intuitive component-based email building
- **Real-time Preview**: See your email in desktop and mobile views
- **Test Email Sending**: Send test emails using EmailJS integration
- **Component Library**: Text, titles, images, buttons, banners, forms, and more
- **Netlify Forms**: Built-in contact form with Netlify integration

- **Professional Fonts**: Source Sans 3 and Source Serif 4 Pro integration

## Setup Instructions

### EmailJS Configuration (Required for Test Email Sending)

1. **Create EmailJS Account**
   - Go to [emailjs.com](https://emailjs.com) and create a free account
   - You get 200 free emails per month

2. **Add Email Service**
   - In EmailJS dashboard, go to "Email Services"
   - Add your email provider (Gmail, Outlook, Yahoo, etc.)
   - Follow the setup instructions for your provider

3. **Create Email Template**
   - Go to "Email Templates" in EmailJS dashboard
   - Create a new template with these variables:
     ```
     To: {{to_email}}
     From: {{from_name}}
     Subject: {{subject}}
     HTML Content: {{{html_content}}}
     Reply To: {{reply_to}}
     ```

4. **Update Configuration**
   - Copy your Service ID, Template ID, and Public Key from EmailJS
   - Update the configuration in `src/components/Header.tsx`:
     ```javascript
     const serviceID = 'YOUR_SERVICE_ID';
     const templateID = 'YOUR_TEMPLATE_ID';
     const publicKey = 'YOUR_PUBLIC_KEY';
     ```

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment

Deploy to Netlify for automatic form handling:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Forms with `data-netlify="true"` will automatically work
4. View form submissions in Netlify dashboard

## Usage

1. **Build Your Email**
   - Drag components from the left palette
   - Customize properties in the right panel
   - Use the preview to see desktop/mobile views

2. **Test Your Email**
   - Click "Send Test" in the header
   - Enter recipient email address
   - Email will be sent using EmailJS

3. **Deploy**
   - Deploy to your preferred hosting platform
   - For Netlify: Forms will automatically work

## Components

- **Text**: Rich text with formatting options
- **Title**: Headings with H1/H2/H3 options
- **Image**: Drag & drop image support
- **Button**: Customizable call-to-action buttons
- **Banner**: Full-width promotional banners
- **Footer**: Email footer with links
- **Content Card**: Image + text + button combinations
- **Contact Form**: Netlify-integrated contact forms
- **Divider**: Visual separators
- **Spacer**: Adjustable spacing

## Technologies

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **EmailJS** for email sending
- **React Quill** for rich text editing
- **Lucide React** for icons
- **Google Fonts** (Source Sans 3, Source Serif 4 Pro)
