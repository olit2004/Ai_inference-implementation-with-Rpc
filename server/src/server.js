require('dotenv').config();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../../protos/ai_inference.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const aiProto = grpcObject.aiinference;

const analyzeSentiment = require('./handlers/sentiment.handler');
const generateText = require('./handlers/generation.handler');
const summarizeText = require('./handlers/summarization.handler');
const chat = require('./handlers/chat.handler');

function main() {
  const server = new grpc.Server();

  server.addService(aiProto.AIInference.service, {
    AnalyzeSentiment: analyzeSentiment,
    GenerateText: generateText,
    SummarizeText: summarizeText,
    Chat: chat,
  });

  const PORT = process.env.PORT || '50051';
  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(`Server failed to start: ${err}`);
        return;
      }
      console.log(` gRPC Server running on port ${port}`);
    }
  );
}

main();