// Iniciacao do replica set single-node para habilitar transacoes ACID no MongoDB.
//
// Executado automaticamente na primeira vez que o container Docker sobe
// (montado em /docker-entrypoint-initdb.d/). Pode ser re-executado com seguranca:
// rs.initiate() falha (e nao faz nada) se o replica set ja estiver iniciado.
//
// Para MongoDB local (nao Docker), rode manualmente:
//   mongosh scripts/init-replicaset.js
try {
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "localhost:27017" }
    ]
  });
  print(">>> Replica set 'rs0' iniciado com sucesso.");
} catch (e) {
  print(">>> Replica set ja iniciado ou erro (ignorar se ja existe): " + e.message);
}
