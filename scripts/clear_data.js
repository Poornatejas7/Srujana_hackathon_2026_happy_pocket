const mongoose = require('mongoose');
const uri = 'mongodb+srv://mykotresh_db_user:ROSTZ9GaDGOqjmaV@cluster0.0bnasia.mongodb.net/happypocket?appName=Cluster0';

async function clearData() {
  await mongoose.connect(uri);
  const delRes = await mongoose.connection.collection('transactions').deleteMany({});
  console.log('Cleared transactions from MongoDB Atlas. Count deleted:', delRes.deletedCount);
  
  await mongoose.connection.collection('bankaccounts').updateOne(
    { isPrimaryUser: true },
    { $set: { balance: 10000.00 } }
  );
  
  const userAcc = await mongoose.connection.collection('bankaccounts').findOne({ isPrimaryUser: true });
  console.log('User Account Balance restored to: ₹' + userAcc?.balance);
  
  const remainingTxs = await mongoose.connection.collection('transactions').countDocuments();
  console.log('Remaining transactions in Atlas:', remainingTxs);
  await mongoose.disconnect();
}

clearData();
