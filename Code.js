function listUsersAndSetSignatures() {
  // Get the list of users from the Admin SDK Directory API
  var users = AdminDirectory.Users.list({domain:'nwfem.com'}).users;
  
  // Loop through the users and print their information
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    var name = user.name && user.name.fullName ? user.name.fullName : "";
    var title = (user.organizations && user.organizations.length && user.organizations[0].title) ? user.organizations[0].title : "";
    var email = user.primaryEmail || "";
    var phoneBlock = "";

    try {
      var phone = user.phones.find(p => p.type === 'work').value;
      phoneBlock = ` | <a href="tel:${phone}" style="color:#505050;text-decoration:none;">${phone.replace(/^(\+\d{1})(\d{3})(\d{3})(\d{4})(?::(\d+))?$/, (match, p1, p2, p3, p4, p5) => `${p1} (${p2}) ${p3}-${p4}${p5 ? ` x${p5}` : ''}`)}</a>`;
    } catch {
      console.log(`${email} does not have a phone number added.`);
    }

    var signatureHTML = getSignatureHTML(name, title, email, phoneBlock);
    // if (name == "Nils Streedain" || name == "Clint Merrell")  // For testing
    console.log(`Set signature for user: ${setSignature(email, signatureHTML).sendAsEmail}`);
  }
}

function getSignatureHTML(name, jobTitle, email, phoneBlock) {
  return `<body style="font-family:Arial,sans-serif;margin:0;padding:0;"><table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:400px;"><tr><td style="padding:10px;"><a href="https://www.nwfem.com"><img src="https://avatars.githubusercontent.com/u/107942673" style="display:block;float:right;height:75px;width:75px;"></a></td><td style="padding:10px;color:#333;font-size:14px;border-left:1px solid #f36f32;"><p style="margin:0;color:#404040;font-weight:bold;">${name}</p><p style="margin:0;color:#505050;">${jobTitle}</p><p style="margin:0;color:#505050;">NW Facilities & Equipment Maintenance</p><p style="margin:0;color:#505050;"><a href="mailto:${email}" style="color:#505050;text-decoration:none;">${email}</a>${phoneBlock}</p></td></tr></table></body>`;
}

function setSignature(email, signatureHTML) {
  var url = `https://www.googleapis.com/gmail/v1/users/me/settings/sendAs/${email}`;

  var params = {
    method: 'PUT',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${getDwaToken(email)}` },
    muteHttpExceptions: true,
    payload: JSON.stringify({ "signature": signatureHTML })
  };

  return JSON.parse(UrlFetchApp.fetch(url, params).getContentText());
}

function getDwaToken(email) {
  return OAuth2.createService(`Gmail: ${email}`)
    .setSubject(email)
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setIssuer("service@gmail-signatures-398323.iam.gserviceaccount.com")
    .setScope("https://www.googleapis.com/auth/gmail.settings.basic")
    .setPrivateKey('-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDteABt9pWACLWE\nMz2kf5OqanY/1yQt44CdrggHZtsVGU1UeNP3XeiFkEk0HJMMcGKdfRAkDCgqb++C\nuD/HgCmOSXNEsK64ORNYfRLgl+tCvnH5aY3+1gkWChj+V9r28VnXPN/vfYfflyn0\nnZl9iB9pBc8UD66GJZ7LaGeoFquzcIpzRY/PlYBOpJiOv8G9qRXB8Y6HWgZuLzYN\nhfzEExJtAywCZdoWk14UKga1Su5i95Q6+KK8A+uxfvOFzYiOfHC5STnOCvUEWBaw\n9MTNo0fZATKceYqgsLIw3TY3LIYSwnBkXpnUg38bLMB/WgpBh7AnlX5nkD8MMoWN\ndu57TBlrAgMBAAECggEAImTqnwKuMESn/Gqq3MwI7bpiFSi1L0ZPvHGBQofbEckV\nN7e7xQzKHv+WcrX0IG2YrZnNwC2DQHOaUP3HExSqMCx4RbSCIeGhE9nNuvpAqMKf\ntxGwRNQ9rakEagunMHQlizS1yeC4e3clVwOKldwk5y0LC1X4H6rhlIbd2JfWrPRH\nov18CCRXB6mdBFd920dgcIrhZtrvUh8xf3flqH5steIgGX5IWFx2MwducgdH1QWj\n26yrJPwVloCHQ9B+KeL6kce/huxEz40sBdAWB0NHn9dN5V9lL/vfo4KkMNwcoy2w\nGyNt+4C8Wl+qeRQ6qcWTCf38sHcHSmcyHa9HWP/BuQKBgQD9otDpOuiAex+sr2PU\n3x9HNiMgf0G5TsSnfbeeUbq4JWb2JYSPthFqlFj0J9k/HGAKN9uFQzWyNwwKjbVz\nhCCdlLoqiaHN1wjiQfZLCYzBMdaV4BzuF3zbKV+f4XRsQMYON0V/A4ibVLr6eNUQ\nlxRbR9FspepTb4vpdQ1TjO3VqQKBgQDvrpwraWJPtKYNnf99lwNbgUQfR0xQ/u5T\nwAojn9hZccEvqmRBOvwQPFOC/EK2PT5EuSdCtVLdE/9HllTPMUNUHQxX2Mj5Z8n5\nFBAmRtHAhaLb3MRSS985WHkGIgBSMBnc0zwACrUD8B72hzeqMyl6+dFdbzf4zCK7\ne3KgK1I68wKBgQDw5z8z9z60Ib2xABl7K72Cnrn4eMZNIrKIP1Ey73/Avc2wh2wE\nL7MVHvfqVxrx5ZqWuf0n8vFCZyRptbUdleaApa25D2Z+ovqOJIaxOM3XBeZCDk6M\nGgT+CKsJqVMyKsey4u6AODP9DRpXIoOEsWqlVG5mmqQZQX6LbCEPNXEEmQKBgQDp\ngyqvuMqJcSze03IZf8lLm1MtTh9yQg0cF1tJffAgpI1czRtD2h2+C6gpU3ADcQN7\nnRA9E7+ZmGP78ODLw+kex/ZAl/ql0pKaUwuw3wp4ETqsDhhPPZBLpIC0kufRKv/n\nfv1T5RqarZTdBrwa3CGrqDxsVXEoummUUx9IISzKNQKBgQCiXoIirg3xjZ+cVchz\niw7XVx+miOXfdb4J4jR3IuNfRAZBQu66G+XJOt5WyUfjVUHw5sq9j55lwRoUoHx5\n1Bg4wOV7ie9tO+ByursvqBlMVQmbLC+civNd5aBhOuV9AMku7VYSZx51uOnzgK4C\n6O8QCRRT251DXBroiKwVy7NaAQ==\n-----END PRIVATE KEY-----\n')
    .getAccessToken();
}