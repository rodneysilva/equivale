// Limpa entidades criadas pelos testes E2E do banco de desenvolvimento.
// Uso:  mongosh equivale scripts/cleanup-test-data.js
// (ou:  npm run test:cleanup  — exige mongosh no PATH)
//
// Critério: nome/título/content/deliveryAddress casando com marcador de teste
// (/E2E/i) — seguro porque nenhum dado real contém "E2E".
// Também limpa posts/comentários/transações/chat das comunidades/produtos removidos.

const MARKER = /E2E/i;
const LEGACY = /E2E|Mod Test|Unif Coll|Post mod/i; // poluição anterior à padronização

const before = {
  communities: db.communities.countDocuments(),
  products: db.products.countDocuments(),
  services: db.services.countDocuments(),
  posts: db.posts.countDocuments(),
  comments: db.comments.countDocuments(),
  transactions: db.transactions.countDocuments(),
};

// Comunidades de teste -> coleta IDs antes de remover (para limpar postsrelacionados)
const testCommIds = db.communities.find({ Name: LEGACY }, { _id: 1 }).map(c => c._id).toArray();
const testPostIds = db.posts.find({ $or: [{ CommunityId: { $in: testCommIds } }, { Content: MARKER }] }, { _id: 1 }).map(p => p._id).toArray();

const del = {};
del.communities = db.communities.deleteMany({ Name: LEGACY }).deletedCount;
del.products = db.products.deleteMany({ Title: LEGACY }).deletedCount;
del.services = db.services.deleteMany({ Title: LEGACY }).deletedCount;
del.posts = db.posts.deleteMany({ $or: [{ CommunityId: { $in: testCommIds } }, { Content: MARKER }] }).deletedCount;
del.comments = db.comments.deleteMany({ $or: [{ PostId: { $in: testPostIds } }, { Content: MARKER }] }).deletedCount;
del.transactions = db.transactions.deleteMany({
  $or: [
    { DeliveryAddress: MARKER },
    { ReviewComment: MARKER },
    { ItemTitle: LEGACY },
    { BuyerId: { $in: [] } }, // no-op, mantém legibilidade
  ],
}).deletedCount;
// Chat das transações removidas: limpa mensagens órfãs sem transação válida
const validTxIds = new Set(db.transactions.find({}, { _id: 1 }).map(t => String(t._id)).toArray());
let orphanChats = 0;
db.chatmessages.find({}, { _id: 1, TransactionId: 1 }).forEach(m => {
  if (m.TransactionId && !validTxIds.has(String(m.TransactionId))) {
    db.chatmessages.deleteOne({ _id: m._id });
    orphanChats++;
  }
});

print('=== limpeza de dados de teste E2E ===');
print(JSON.stringify({ removidos: del, chats_orfaos: orphanChats }));
print('antes: ' + JSON.stringify(before));
print('depois: ' + JSON.stringify({
  communities: db.communities.countDocuments(),
  products: db.products.countDocuments(),
  services: db.services.countDocuments(),
  posts: db.posts.countDocuments(),
  comments: db.comments.countDocuments(),
  transactions: db.transactions.countDocuments(),
}));
