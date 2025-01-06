const readline = require("readline");
const sqlite3 = require("sqlite3").verbose();
const { exec } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const db = new sqlite3.Database("jollibee.db");

const clear = () => {
  const command = process.platform === "win32" ? "cls" : "clear";
  exec(command, () => {});
};

const setupDatabase = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      food TEXT,
      quantity INTEGER,
      total INTEGER,
      cash INTEGER,
      change INTEGER
    )`);
  });
};

const foodMenu = {
  1: { name: "Chicken Joy", price: 100 },
  2: { name: "Burger Steak", price: 85 },
  3: { name: "Spaghetti", price: 100 },
  4: { name: "Hamburger", price: 50 },
  5: { name: "Crispy Fries", price: 50 },
};

const mainMenu = () => {
  console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Jollibee Foods Store  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┫
┃     1. Order           ┃
┃     2. View Order      ┃
┃     3. History         ┃
┃     0. Exit            ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━┛`);
  rl.question("Choice: ", (choice) => {
    clear();
    switch (parseInt(choice)) {
      case 1:
        order();
        break;
      case 2:
        viewOrder();
        break;
      case 3:
        history();
        break;
      case 0:
        console.log("Thank you for visiting Jollibee!");
        process.exit();
      default:
        console.log("Invalid choice! Try again.");
        mainMenu();
    }
  });
};

const order = () => {
  console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃      Jollibee Foods    ┃ Price  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  1. Chicken Joy        ┃  ₱100  ┃
┃  2. Burger Steak       ┃  ₱85   ┃
┃  3. Spaghetti          ┃  ₱100  ┃
┃  4. Hamburger          ┃  ₱50   ┃
┃  5. Crispy Fries       ┃  ₱50   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
  rl.question("Choice (1-5): ", (foodChoice) => {
    const food = foodMenu[parseInt(foodChoice)];
    if (!food) {
      console.log("Invalid choice! Returning to main menu.");
      setTimeout(() => {
        clear();
        mainMenu();
      }, 2000);
      return;
    }
    rl.question("Quantity: ", (quantity) => {
      const totalPrice = food.price * parseInt(quantity);
      rl.question("Name: ", (name) => {
        db.run(
          "INSERT INTO orders (name, food, quantity, total) VALUES (?, ?, ?, ?)",
          [name, food.name, quantity, totalPrice],
          () => {
            console.log("Order successfully recorded!");
            rl.question("Press Enter to continue...", () => {
              clear();
              mainMenu();
            });
          }
        );
      });
    });
  });
};

const viewOrder = () => {
  db.get("SELECT * FROM orders ORDER BY id DESC LIMIT 1", (err, order) => {
    if (!order) {
      console.log("Oops, no orders yet!");
      rl.question("Press Enter to exit...", () => {
        clear();
        mainMenu();
      });
    } else {
      console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  Order Details                      ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  Name: ${order.name}                      ┃
┃  Food: ${order.food}                      ┃
┃  Quantity: ${order.quantity}               ┃
┃  Total Price: ₱${order.total}        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`);
      rl.question("1. Payment\n0. Back\nEnter: ", (choice) => {
        clear();
        if (parseInt(choice) === 1) {
          deposit(order.id, order.total);
        } else {
          mainMenu();
        }
      });
    }
  });
};

const deposit = (orderId, totalPrice) => {
  console.log("  Jollibee Deposit");
  console.log("━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Total price: ₱${totalPrice}`);
  rl.question("Deposit cash: ₱", (cashInput) => {
    const cash = parseInt(cashInput);
    if (cash < totalPrice) {
      console.log("Insufficient cash! Returning to main menu.");
      setTimeout(() => {
        clear();
        mainMenu();
      }, 2000);
      return;
    }
    const change = cash - totalPrice;
    db.run(
      "UPDATE orders SET cash = ?, change = ? WHERE id = ?",
      [cash, change, orderId],
      () => {
        console.log("Payment successfully recorded!");
        console.log(`Change: ₱${change}`);
        rl.question("Press Enter to continue...", () => {
          clear();
          mainMenu();
        });
      }
    );
  });
};

const history = () => {
  db.all("SELECT * FROM orders", (err, orders) => {
    if (!orders.length) {
      console.log("Oops, no order history yet!");
      rl.question("Press Enter to exit...", () => {
        clear();
        mainMenu();
      });
    } else {
      console.log("   Payment History");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━");
      orders.forEach((order) => {
        console.log(
          `ID: ${order.id} | Name: ${order.name} | Food: ${order.food} x${order.quantity} | Total: ₱${order.total} | Cash: ₱${order.cash} | Change: ₱${order.change}`
        );
      });
      console.log("━━━━━━━━━━━━━━━━━━━━━━━");
      rl.question("Press Enter to continue...", () => {
        clear();
        mainMenu();
      });
    }
  });
};

setupDatabase();
clear();
mainMenu();
