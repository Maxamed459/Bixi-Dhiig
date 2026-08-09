export function welcomeTemplate(display_name: string) {
  return `
  <div style="margin: 0; padding: 0; background-color: #f7f9fa">
    <!-- Main Container Centered at 600px -->
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
    >
      <tr>
        <td align="center" style="padding: 20px 0">
          <table
            role="presentation"
            width="600"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
            "
          >
            <!-- Email Body Section -->
            <tr>
              <td
                style="
                  padding: 40px 30px;
                  font-family:
                    &quot;Segoe UI&quot;, Tahoma, Geneva, Verdana, sans-serif;
                "
              >
                <!-- Greeting -->
                <h1
                  style="
                    margin: 0 0 20px 0;
                    color: #cc0000;
                    font-size: 26px;
                    font-weight: 700;
                    line-height: 32px;
                  "
                >
                  Welcome, ${display_name}
                </h1>

                <!-- Friendly Small Talk -->
                <p
                  style="
                    margin: 0 0 16px 0;
                    color: #2d3748;
                    font-size: 16px;
                    line-height: 24px;
                  "
                >
                  We are incredibly thrilled to have you join the
                  <strong>bixi-dhiig</strong> community. Whether you signed up
                  today to save a life as a donor, or you are looking for urgent
                  support for a loved one, please know that you are no longer
                  walking this path alone.
                </p>

                <p
                  style="
                    margin: 0 0 24px 0;
                    color: #4a5568;
                    font-size: 15px;
                    line-height: 24px;
                  "
                >
                  Every single second counts when blood is needed. By creating
                  your account, you have officially raised your hand to become
                  someone's real-life superhero. Together, we are building a
                  seamless bridge between hope and urgent action.
                </p>

                <!-- Call to Action Button -->
                <table
                  role="presentation"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  align="center"
                  style="margin: 30px auto"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#cc0000"
                      style="border-radius: 6px"
                    >
                      <a
                        href="https://bixi-dhiig.vercel.app/dashboard"
                        target="_blank"
                        style="
                          font-size: 16px;
                          font-family: Arial, sans-serif;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 6px;
                          padding: 14px 32px;
                          border: 1px solid #cc0000;
                          display: inline-block;
                          font-weight: bold;
                        "
                      >
                        Complete Your Donor Profile
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Closing Note -->
                <p
                  style="
                    margin: 24px 0 0 0;
                    color: #718096;
                    font-size: 14px;
                    line-height: 20px;
                    font-style: italic;
                    border-top: 1px solid #edf2f7;
                    padding-top: 20px;
                  "
                >
                  Did you know? One single blood donation can save up to three
                  lives. Thank you for making a difference.
                </p>
              </td>
            </tr>

            <!-- Footer Area -->
            <tr>
              <td
                align="center"
                style="
                  padding: 20px 30px;
                  background-color: #f7f9fa;
                  color: #a0aec0;
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                "
              >
                © 2026 bixi-dhiig. All rights reserved.<br />
                You received this email because you registered on our platform.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `;
}
