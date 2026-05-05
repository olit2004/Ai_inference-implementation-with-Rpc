require('dotenv').config();


const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');

const PROTO_PATH = path.join(__dirname, '../../protos/ai_inference.proto');
const packageDef = protoLoader.loadSync(PROTO_PATH, {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const aiProto = grpcObject.aiinference;

const SERVER_ADDR = process.env.SERVER_ADDR || 'localhost:8080';
const client = new aiProto.AIInference(SERVER_ADDR, grpc.credentials.createInsecure());


function header(title) {
  console.log('\n' + chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(chalk.cyan.bold(`  ${title}`));
  console.log(chalk.cyan.bold('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
}

function success(msg) { console.log(chalk.green('✔ ' + msg)); }
function info(msg) { console.log(chalk.blue('ℹ ' + msg)); }
function error(msg) { console.log(chalk.red('✖ ' + msg)); }
function divider() { console.log(chalk.gray('\n------------------------------\n')); }

//  Unary RPC (Sentiment Analysis)
function testSentiment() {
  return new Promise((resolve) => {
    header('SENTIMENT ANALYSIS (Unary RPC)');
    info('Sending request to AI model...');

    client.AnalyzeSentiment(
      { text: 'I absolutely love this product!' },
      (err, res) => {
        if (err) {
          error(`Sentiment Error: ${err.message}`);
          return resolve();
        }

        divider();
        console.log(chalk.yellow('Result:'));
        console.log(`Label: ${chalk.green.bold(res.label)}`);
        console.log(`Confidence: ${chalk.magenta(res.confidence)}`);
        resolve();
      }
    );
  });
}

//  Server Streaming (Text Generation)
function testGeneration() {
  return new Promise((resolve) => {
    header('TEXT GENERATION (Server Streaming RPC)');
    info('Streaming response...\n');

    const call = client.GenerateText({
      prompt: 'Write a short story about AI',
      max_tokens: 100,
    });

    call.on('data', (chunk) => {
      process.stdout.write(chalk.white(chunk.token));
    });

    call.on('error', (err) => {
      error(`Generation Error: ${err.message}`);
      resolve();
    });

    call.on('end', () => {
      divider();
      success('Stream completed');
      resolve();
    });
  });
}

//  Client Streaming (Summarization)
function testSummarization() {
  return new Promise((resolve) => {
    header('SUMMARIZATION (Client Streaming RPC)');
    info('Sending document chunks...\n');

    const call = client.SummarizeText((err, res) => {
      if (err) {
        error(`Summarization Error: ${err.message}`);
        return resolve();
      }
      divider();
      console.log(chalk.yellow.bold('SUMMARY:'));
      console.log(res.summary);
      resolve();
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
  });
}

// Bidirectional Streaming (Chat)
function testChat() {
  return new Promise((resolve) => {
    header('CHAT (Bidirectional Streaming RPC)');
    info('Starting conversation...\n');

    const call = client.Chat();

    call.on('data', (res) => {
      process.stdout.write(chalk.green(res.message));
    });

    call.on('error', (err) => {
      error(`Chat Error: ${err.message}`);
      resolve();
    });

    const messages = ['Hello AI!', 'Can you explain microservices?', 'Thanks!'];
    let i = 0;

    const interval = setInterval(() => {
      if (i >= messages.length) {
        clearInterval(interval);
        call.end();
        setTimeout(resolve, 1000); // Wait for last response
        return;
      }

      console.log(chalk.blue.bold('\n\nYou: ') + messages[i]);
      call.write({ user_id: 'user1', message: messages[i] });
      i++;
    }, 1500);
  });
}

//  Sequential CLI Tester
async function runFullTest() {
  console.clear();
  console.log(chalk.bgCyan.black.bold('\n       AI MICROSERVICE FULL SYSTEM TEST       \n'));

  await testSentiment();
  await testGeneration();
  await testSummarization();
  await testChat();

  console.log(chalk.bgGreen.black.bold('\n       ALL TESTS COMPLETED       \n'));
  process.exit(0);
}

// Interactive Menu
function showMenu() {
  console.log(chalk.cyan.bold('\n      AI INFERENCE CLI'));
  console.log('1. Sentiment Analysis');
  console.log('2. Text Generation (Streaming)');
  console.log('3. Summarization');
  console.log('4. Chat Assistant');
  console.log('5. RUN FULL SEQUENTIAL TEST (Task 7)');
  console.log('6. Exit\n');
}

function main() {
  if (process.argv.includes('--test')) {
    runFullTest();
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  showMenu();

  rl.question(chalk.yellow('Select option → '), async (answer) => {
    switch (answer) {
      case '1': await testSentiment(); break;
      case '2': await testGeneration(); break;
      case '3': await testSummarization(); break;
      case '4': await testChat(); break;
      case '5': await runFullTest(); break;
      case '6': process.exit(0);
    }
    setTimeout(() => main(), 1000);
  });
}

main();
