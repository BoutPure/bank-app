'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2022-03-06T17:22:52.160Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

// ------------- UTILS FOR DATES AND CURRENCY -------------

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const formatDate = (date, locale, datesToWords = false) => {
  if (datesToWords) {
    const daysPassed = Math.round(calcDaysPassed(new Date(), date));
    // console.log(daysPassed);
    if (daysPassed == 0) return 'Today';
    if (daysPassed == 1) return 'Yesterday';
  }
  return new Intl.DateTimeFormat(locale).format(date);
  // return `${date.getDate().toString().padStart(2, '0')}/${
  //   date.getMonth() + 1
  // }/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date
  //   .getMinutes()
  //   .toString()
  //   .padStart(2, '0')}`;
};

const formatCurr = (value, locale, curr) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr,
  }).format(value);

// ------------- GET MOVEMENTS -------------

const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(account.movementsDates[i]);
    const displayDate = formatDate(date, account.locale, true);

    const formattedMov = formatCurr(mov, account.locale, account.currency);
    // const formattedMov = new Intl.NumberFormat(account.locale, {
    //   style: 'currency',
    //   currency: account.currency,
    // }).format(mov);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
      </div>`;
    // <div class="movements__value">${mov.toFixed(2)}€</div>

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// ------------- ADD USERNAMES -------------

const createUsernames = accs => {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

// ------------- BALANCE AND SUMMARY -------------

const calcDisplayBalance = acc => {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedMov = formatCurr(acc.balance, acc.locale, acc.currency);

  labelBalance.textContent = `${formattedMov}`;
};

const calcDisplaySummary = acc => {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurr(incomes, acc.locale, acc.currency);
  // labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc - mov, 0);
  labelSumOut.textContent = formatCurr(outcomes, acc.locale, acc.currency);
  // labelSumOut.textContent = `${outcomes.toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurr(interest, acc.locale, acc.currency);
  // labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

let currAcc, glTimer;

// ------------- LOGIN -------------

// ------- FAKE LOGIN -------
// currAcc = account1;
// updateUI(currAcc);
// containerApp.style.opacity = 100;
// -------

const startLogoutTimer = () => {
  const tick = () => {
    const mins = (Math.trunc(time / 60) + '').padStart(2, '0');
    const secs = ((time % 60) + '').padStart(2, '0');

    labelTimer.textContent = `${mins}:${secs}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    --time;
  };

  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const loginTry = function (event) {
  event.preventDefault(); // Prevent form from submitting
  currAcc = accounts.find(
    acc => inputLoginUsername.value.trim() == acc.username
  );
  if (currAcc?.pin === Number(inputLoginPin.value)) {
    // Display UI
    labelWelcome.textContent = `Welcome back, ${currAcc.owner.split(' ')[0]}!`;

    containerApp.style.opacity = 100;

    // Create current date and time
    const nowtime = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      // month: 'long',
      year: 'numeric',
      // weekday: 'long',
    };
    const locale = 'en-GB';
    labelDate.textContent = new Intl.DateTimeFormat(
      currAcc.locale,
      options
    ).format(nowtime);

    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();

    if (glTimer) clearInterval(glTimer);
    glTimer = startLogoutTimer();

    updateUI(currAcc);
  }
};

btnLogin.addEventListener('click', loginTry);

// ------------- ACCOUNT ACTIONS -------------

btnTransfer.addEventListener('click', function (event) {
  event.preventDefault(); // Prevent form from submitting
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currAcc.balance >= amount &&
    receiverAcc?.username !== currAcc.username
  ) {
    currAcc.movements.push(-amount);
    currAcc.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());

    updateUI(currAcc);

    clearInterval(glTimer);
    glTimer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  // const amount = Number(inputLoanAmount.value);
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currAcc.movements.some(mov => mov >= amount * 0.1))
    setTimeout(function () {
      currAcc.movements.push(amount);
      currAcc.movementsDates.push(new Date().toISOString());
      updateUI(currAcc);
    }, 3000);
  inputLoanAmount.value = '';
  clearInterval(glTimer);
  glTimer = startLogoutTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currAcc.username &&
    Number(inputClosePin.value) === currAcc.pin
  ) {
    const i = accounts.findIndex(
      acc => acc.username === currAcc.username && acc.pin === currAcc.pin
    );
    containerApp.style.opacity = 0;
    accounts.splice(i, 1);
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

// ------------- MOVs SORTING -------------

let isMovsSorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currAcc, !isMovsSorted);
  isMovsSorted = !isMovsSorted;
});

// const now = new Date();
// // labelDate.textContent = now.toDateString();
// labelDate.textContent = formatDate(now);

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// console.log(23 === 23.0); // true
// console.log(0.1 + 0.2); // 0.30000000000000004
// console.log(0.1 + 0.2 === 0.3); // false

// console.log(Number('23')); // 23 num
// console.log(+'23'); // 23 num

// // Parsing
// console.log(Number.parseInt('30px')); // 30 num
// console.log(Number.parseInt('easd30px')); // NaN

// console.log(Number.parseInt(' 2.5ed  ')); // 2 num
// console.log(Number.parseFloat(' 2.5ed  ')); // 2.5 num

// // Checking if value is NaN
// console.log(Number.isNaN(20)); // false
// console.log(Number.isNaN('asd')); // false
// console.log(Number.isNaN(+'2asd')); // true
// console.log(Number.isNaN(+'asd2')); // true

// // Checking if value is number
// console.log('------------'); // false
// console.log(Number.isFinite(20)); // true
// console.log(Number.isFinite('asd')); // false
// console.log(Number.isFinite(+'2asd')); // false
// console.log(Number.isFinite(+'asd2')); // false

// console.log(Number.isInteger(+'23')); // true
// console.log(Number.isInteger(+'23.0')); // true

// console.log(Math.sqrt(25)); // 5
// console.log(25 ** (1 / 2)); // 5

// console.log(Math.max(4, 523, 43, 52, 87)); // 523
// console.log(Math.max(4, 523, 43, '52', 87)); // 523 type coertion
// console.log(Math.min(4, 523, 43, 52, 87)); // 4

// console.log(Math.PI); // 3.141592653589793
// console.log(Math.random() * 10); // rand value

// const randomInt = (min, max) =>
//   Math.trunc(Math.random() * (max - min) + 1) + min;

// console.log(randomInt(10, 20)); // rand num from 10 to 20

// // Rounding integers
// console.log(Math.trunc(23.33)); // 23

// console.log(Math.round(23.33)); // 23
// console.log(Math.round(23.9)); // 24

// console.log(Math.ceil(23.33)); // 24 up
// console.log(Math.ceil(23.9)); // 24

// console.log(Math.floor(23.33)); // 23
// console.log(Math.floor('23.9')); // 23 down

// console.log(Math.trunc(-23.33)); // -23
// console.log(Math.floor(-23.33)); // -24 better

// // Rounding decimals

// console.log((2.7).toFixed(0)); // 3 str
// console.log((2.7).toFixed(3)); // 2.700 str
// console.log(+(2.7).toFixed(3)); // 2.700 num

// console.log(5 % 2); // 1 - remainder
// console.log(5 / 2); // 2.5
// console.log(8 % 3); // 2

// console.log(4 % 2); // 0, so 4 is even
// console.log(5 % 2); // 1, so 5 is odd

// const isEven = n => n % 2 === 0;

// console.log(isEven(8)); // true
// console.log(isEven(9)); // false

// [...document.querySelectorAll('.movements__row')].forEach((row, i) => {
//   isEven(i) ? (row.style.backgroundColor = 'orangered') : 0;
//   i % 3 === 0 ? (row.style.backgroundColor = 'blue') : 0;
// });

// // 287,460,000,000
// const diameter = 287_460_000_000;
// console.log(diameter); // 287460000000

// const transferFee1 = 15_00;
// const transferFee2 = 1_500;

// const PI = 3.14_15;
// console.log(PI);

// console.log(+'230_000'); // NaN

// console.log(2 ** 53 - 1); // 9007199254740991
// console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
// console.log(2 ** 53 + 1); // 9007199254740992
// console.log(2 ** 53 + 2); // 9007199254740994
// console.log(2 ** 53 + 3); // 9007199254740996
// console.log(2 ** 53 + 4); // 9007199254740996
// console.log(43857284759837240912840918320492347923742349823049n); // 43857284759837240912840918320492347923742349823049n

// // console.log(10000n + 100); // ERROR

// console.log(10000n + 100n); // 10100n
// console.log(20n > 15); // true
// console.log(20n == 20); // true
// console.log(20n === 20); // false

// // Math does not work with BigInt
// console.log(11n / 3n); // 3n
// console.log(11 / 3); // 3.6666666666666665

// Create a date
// const now = new Date();
// console.log(now);

// console.log(new Date('Dec 21, 2022')); // Wed Dec 21 2022 00:00:00 GMT+0300 (Moscow Standard Time)
// console.log(new Date(account1.movementsDates[0])); // Tue Nov 19 2019 00:31:17 GMT+0300 (Moscow Standard Time)

// console.log(new Date(2037, 10, 19, 15, 23, 5)); // Thu Nov 19 2037 15:23:05 GMT+0300 (Moscow Standard Time)
// console.log(new Date(2037, 10, 33)); // Thu Dec 03 2037 00:00:00 GMT+0300 (Moscow Standard Time)

// console.log(new Date(0)); // Thu Jan 01 1970 03:00:00 GMT+0300 (Moscow Standard Time)

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future); // Thu Nov 19 2037 15:23:00 GMT+0300 (Moscow Standard Time)
// console.log(future.getFullYear()); // 2037
// console.log(future.getMonth()); // 10
// console.log(future.getDate()); // 19
// console.log(future.getDay()); // 4
// console.log(future.getHours()); // 15
// console.log(future.getMinutes()); // 23
// console.log(future.getSeconds()); // 0
// console.log(future.getMilliseconds()); // 0
// console.log(future.toISOString()); // 2037-11-19T12:23:00.000Z
// console.log(future.toDateString()); // Thu Nov 19 2037
// console.log(future.getTime()); // 2142246180000

// const future = new Date(2038, 10, 10, 10, 12);
// console.log(future);

// // const calcDaysPassed = (date1, date2) =>
// //   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const day1 = calcDaysPassed(new Date(2038, 5, 10), new Date(2038, 7, 10));

// console.log(day1);

// const num = 321456.78;

// const options = {
//   // style: 'unit',
//   style: 'currency',
//   unit: 'celsius',
//   // unit: 'mile-per-hour',
//   currency: 'EUR',
//   // useGrouping: false,
// };

// console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
// console.log('GE: ', new Intl.NumberFormat('de-DE', options).format(num));
// console.log('SY: ', new Intl.NumberFormat('ar-SY', options).format(num));
// console.log(
//   'B:  ',
//   new Intl.NumberFormat(navigator.language, options).format(num)
// );

// setTimeout(() => console.log(`Here's your pizza!`), 3000);
// // Here's your pizza! AFTER 4 SEC
// console.log('Waiting...'); // Waiting...

// // way to pass agrs to func
// const piz = ['4 Cheese', 'Enjoy!'];
// setTimeout(
//   (pizza, msg) => console.log(`Here's your ${pizza} pizza! ${msg}`),
//   4000,
//   ...piz
// ); // Here's your 4 Cheese pizza! Enjoy! AFTER 5 SEC

// // Way to dismiss some Timer
// const pizz = ['4 Cheese', 'DIE'];
// const pizzTimer = setTimeout(
//   (pizza, msg) => console.log(`Here's your ${pizza} pizza! ${msg}`),
//   5000,
//   ...pizz
// ); // Won't be displayed cuz of 'DIE'

// if (pizz.includes('DIE')) clearTimeout(pizzTimer);

// setInterval(() => {
//   const now = new Date().toTimeString();
//   console.log(now);
// }, 1000);
// // Will print current time in format
// // 13:50:13 GMT+0300 (Moscow Standard Time)
