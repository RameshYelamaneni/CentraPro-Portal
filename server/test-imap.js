const Imap = require('imap');

const imap = new Imap({
  user: 'invoice@rightarc.com',
  password: 'Trs@538783',
  host: 'outlook.office365.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.once('ready', () => {
  console.log('✅ IMAP Connection successful!');
  imap.openBox('INBOX', false, (err, box) => {
    if (err) {
      console.error('❌ Error opening inbox:', err.message);
      process.exit(1);
    }
    console.log(`✅ Inbox opened! Messages: ${box.messages.total}`);
    imap.end();
    process.exit(0);
  });
});

imap.once('error', (err) => {
  console.error('❌ IMAP Error:', err.message);
  process.exit(1);
});

imap.connect();
