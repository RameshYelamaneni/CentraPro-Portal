const Imap = require('imap');

console.log('🔍 Testing IMAP connection...\n');

const imap = new Imap({
  user: 'invoice@rightarc.com',
  password: 'Trs@538783',
  host: 'outlook.office365.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false }
});

imap.once('ready', () => {
  console.log('✅ IMAP connected successfully!');
  imap.openBox('INBOX', false, (err, box) => {
    if (err) {
      console.error('❌ Error opening inbox:', err.message);
      imap.end();
      return;
    }
    console.log(`✅ Inbox opened!`);
    console.log(`📧 Total messages: ${box.messages.total}`);
    console.log(`📬 Unread messages: ${box.messages.unseen}`);
    imap.end();
  });
});

imap.once('error', (err) => {
  console.error('❌ IMAP Error:', err.message);
  console.error('Full error:', err);
});

imap.once('end', () => {
  console.log('\n🔌 Connection closed');
  process.exit(0);
});

console.log('Connecting to outlook.office365.com:993...');
imap.connect();
