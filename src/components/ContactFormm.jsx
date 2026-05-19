// src/components/ContactForm.jsx
import { createSignal } from 'solid-js';

const ContactFormm = () => {
  const [messageSent, setMessageSent] = createSignal(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      const response = await fetch('/api/send-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setMessageSent(true);
      } else {
        console.error('Failed to send the message.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div class="card card-plain">
      <form id="contact-form" onsubmit={handleSubmit} method="POST">
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label>Full name</label>
                <div class="input-group mb-4">
                  <span class="input-group-text"><i class="ni ni-align-start-2"></i></span>
                  <input name="name" id="name" class="form-control" placeholder="Full Name" type="text" required autocomplete="name" />
                </div>
              </div>
            </div>
            <div class="col-md-6 ps-md-2">
              <div class="form-group">
                <label>Email</label>
                <div class="input-group mb-4">
                  <span class="input-group-text"><i class="ni ni-email-83"></i></span>
                  <input name="email" id="email" class="form-control" placeholder="Email" type="email" required autocomplete="email" />
                </div>
              </div>
            </div>
          </div>
          <div class="form-group mb-4 mt-md-0 mt-4">
            <label>What can we help you with?</label>
            <textarea name="message" id="message" class="form-control" rows="6" placeholder="Describe your problem in at least 250 characters" required autocomplete="off"></textarea>
          </div>
          <div class="row">
            <div class="col-md-12 text-center">
              <button type="submit" class="btn bg-gradient-info mt-4">Send Message</button>
            </div>
          </div>
        </div>
      </form>

      {messageSent() && (
        <div class="alert alert-success mt-3">
          Your message has been sent successfully!
        </div>
      )}
    </div>
  );
};

export default ContactFormm;
