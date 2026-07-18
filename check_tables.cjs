const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.yxqezrvgvfwdgrlwczea:Alliswell12%40%40@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres' });
client.connect().then(() => {
  return client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
}).then(res => {
  console.log(res.rows.map(r => r.table_name));
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
