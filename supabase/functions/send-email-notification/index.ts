import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailPayload {
  projectTitle: string
  description: string
  customerName: string
  customerEmail: string
  projectId: string
  service: string
  preferredDate?: string
  preferredTime?: string
  imageUrls?: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📧 Email notification function triggered')
    
    const { projectTitle, description, customerName, customerEmail, projectId, service, preferredDate, preferredTime, imageUrls }: EmailPayload = await req.json()
    
    console.log('📋 Email payload received:', { projectTitle, customerName, service })
    
    const brevoApiKey = Deno.env.get('BREVO_API_KEY')
    if (!brevoApiKey) {
      throw new Error('Brevo API key not found in environment variables')
    }
    
    // Create the email payload for Brevo
    const emailData = {
          sender: {
        name: "LandscapeBid Pro",
        email: "titanbusinesspros@gmail.com"
      },
      to: [
        {
          email: "titanbusinesspros@gmail.com",
          name: "Admin Team"
        }
      ],
      subject: `New Landscape Project: ${service} - ${customerName}`,
      htmlContent: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #3a9b3a, #5cb85c); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .project-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3a9b3a; }
              .detail-row { margin: 10px 0; }
              .label { font-weight: bold; color: #3a9b3a; }
              .value { margin-left: 10px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .button { display: inline-block; background: #3a9b3a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌱 New Landscape Project Submitted</h1>
                <p>A new customer has posted a landscaping project on LandscapeBid Pro</p>
              </div>
              
              <div class="content">
                <div class="project-details">
                  <h2>📋 Project Details</h2>
                  
                  <div class="detail-row">
                    <span class="label">Project ID:</span>
                    <span class="value">${projectId}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="label">Service Requested:</span>
                    <span class="value">${service}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="label">Customer Name:</span>
                    <span class="value">${customerName}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span class="label">Customer Email:</span>
                    <span class="value">${customerEmail}</span>
                  </div>
                  
                  ${preferredDate ? `
                  <div class="detail-row">
                    <span class="label">Preferred Date:</span>
                    <span class="value">${preferredDate}</span>
                  </div>
                  ` : ''}
                  
                  ${preferredTime ? `
                  <div class="detail-row">
                    <span class="label">Preferred Time:</span>
                    <span class="value">${preferredTime}</span>
                  </div>
                  ` : ''}
              ${description ? `
              <div class="detail-row">
                <span class="label">Project Description:</span>
                <div class="value" style="margin-top: 10px; padding: 15px; background: #f5f5f5; border-radius: 5px; white-space: pre-wrap;">${description}</div>
              </div>
              ` : ''}
              
              <!-- Project Images Section -->
              <div class="detail-row">
                <span class="label">Project Images:</span>
                <div class="value" style="margin-top: 10px;">
                  ${imageUrls && imageUrls.length > 0 ? `
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 10px;">
                      ${imageUrls.map((imageUrl, index) => `
                        <img src="${imageUrl}" 
                             alt="Project image ${index + 1}" 
                             style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #e0e0e0;">
                      `).join('')}
                    </div>
                    <p style="margin-top: 10px; font-size: 12px; color: #666;">
                      📸 ${imageUrls.length} image(s) uploaded by customer
                    </p>
                  ` : `
                    <p style="margin-top: 10px; padding: 15px; background: #f5f5f5; border-radius: 5px; color: #666; font-style: italic;">
                      📷 No images uploaded for this project
                    </p>
                  `}
                </div>
              </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p>🚀 <strong>Next Steps:</strong></p>
                  <p>1. Review the project details above</p>
                  <p>2. Access your admin panel to assign contractors</p>
                  <p>3. Set up chat rooms for customer-contractor communication</p>
                </div>
                
                <div class="footer">
                  <p>This email was automatically generated by LandscapeBid Pro when a new project was submitted.</p>
                  <p>📅 Submitted: ${new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `
    }
    
    console.log('🚀 Sending email via Brevo API...')
    
    // Send email using Brevo API
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify(emailData)
    })
    
    const responseData = await response.json()
    console.log('📨 Brevo API response:', responseData)
    
    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(responseData)}`)
    }
    
    console.log('✅ Email sent successfully!')
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notification sent successfully',
        messageId: responseData.messageId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
    
  } catch (error) {
    console.error('💥 Error sending email notification:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email notification'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})