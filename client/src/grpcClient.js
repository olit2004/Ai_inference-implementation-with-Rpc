// client/src/grpcClient.js

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');


const PROTO_PATH = path.join(__dirname, '../../protos/ai_inference.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);

const aiProto = grpcObject.aiinference;

const client = new aiProto.AIInference(
  'localhost:8080',
  grpc.credentials.createInsecure()
);


function header(title) {
  console.log('\n' + chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

function success(msg) {
  console.log(chalk.green('✔ ' + msg));
}

function info(msg) {
  console.log(chalk.blue('ℹ ' + msg));
}

function error(msg) {
  console.log(chalk.red('✖ ' + msg));
}

function divider() {
  console.log(chalk.gray('\n------------------------------\n'));
}



function testSentiment() {
  header('SENTIMENT ANALYSIS (Unary RPC)');

  info('Sending request to AI model...');

  client.AnalyzeSentiment(
    { text: 'I absolutely love this product!' },
    (err, res) => {
      if (err) return error(err.message);

      divider();
      console.log(chalk.yellow('Result:'));
      console.log(
        `Label: ${chalk.green.bold(res.label)}`
      );
      console.log(
        `Confidence: ${chalk.magenta(res.confidence)}`
      );
    }
  );
}


function testGeneration() {
  header('TEXT GENERATION (Server Streaming RPC)');

  info('Streaming response...\n');

  const call = client.GenerateText({
    prompt: 'Write a short story about AI',
    max_tokens: 100,
  });

  let output = '';

  call.on('data', (chunk) => {
    process.stdout.write(chalk.white(chunk.token));
    output += chunk.token;
  });

  call.on('end', () => {
    divider();
    success('Stream completed');
  });
}


function testSummarization() {
  header('SUMMARIZATION (Client Streaming RPC)');

  info('Sending document chunks...\n');

  const call = client.SummarizeText((err, res) => {
    if (err) return error(err.message);

    divider();
    console.log(chalk.yellow.bold('SUMMARY:'));
    console.log(res.summary);
  });

  const chunks = [
    'AI is transforming the world.',
    'It is used in healthcare, education, and business.',
    'Many companies are adopting AI solutions.',
  ];

  chunks.forEach((chunk, i) => {
    info(`Sending chunk ${i + 1}`);
    call.write({ chunk });
  });

  call.end();
}


function testChat() {
  header('CHAT (Bidirectional Streaming RPC)');

  info('Starting conversation...\n');

  const call = client.Chat();

  call.on('data', (res) => {
    process.stdout.write(chalk.green(res.message));
  });

  const messages = [
    'Hello AI!',
    'Can you explain microservices?',
    'Thanks!',
  ];

  let i = 0;

  const interval = setInterval(() => {
    if (i >= messages.length) {
      clearInterval(interval);
      call.end();
      return;
    }

    console.log(chalk.blue.bold('\n\nYou: ') + messages[i]);

    call.write({
      user_id: 'user1',
      message: messages[i],
    });

    i++;
  }, 1500);
}

function showMenu() {
  console.clear();


  console.log(chalk.cyan.bold('      AI INFERENCE CLI'));


  console.log(chalk.white('1.') + ' Sentiment Analysis');
  console.log(chalk.white('2.') + ' Text Generation (Streaming)');
  console.log(chalk.white('3.') + ' Summarization');
  console.log(chalk.white('4.') + ' Chat Assistant');
  console.log(chalk.white('5.') + ' Exit\n');
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function handleChoice(choice) {
  switch (choice.trim()) {
    case '1':
      testSentiment();
      break;
    case '2':
      testGeneration();
      break;
    case '3':
      testSummarization();
      break;
    case '4':
      testChat();
      break;
    case '5':
      console.log(chalk.gray('\nExiting...\n'));
      process.exit(0);
    default:
      error('Invalid choice');
  }
}

function main() {
  showMenu();

  rl.question(chalk.yellow('Select option → '), (answer) => {
    handleChoice(answer);

    setTimeout(() => main(), 1000);
  });
}

main();
