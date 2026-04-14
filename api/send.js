const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  console.log('Incoming Payload:', req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, message } = req.body;

    if (!email || !message) {
      console.log('Validation Failed: Missing Fields');
      return res.status(400).json({ error: 'Email and message are required' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Artifex Contact <onboarding@resend.dev>', 
      to: ['josephtsenjiaen@gmail.com'], 
      subject: `New Project Inquiry from ${firstName} ${lastName}`,
      html: `
        <h2>New Inquiry from Artifex Lab</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('RESEND ERROR:', error);
      return res.status(400).json(error);
    }

    console.log('SUCCESS:', data);
    res.status(200).json(data);
  } catch (err) {
    console.error('SERVER ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
};
