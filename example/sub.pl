class Account(name,balance)

  this.name = name
  this.balance = balance

  sub deposit(money)
    this.balance += money

  sub withdraw(money)
    this.balance -= money


class WellsFargo extends Account(name,balance)
  super(name,balance)

  sub printBalance()
    if this.balance == 0
      console.log(this.name + '\'s balance is ' + this.balance + ' :(')
    else
      console.log(this.name + '\'s balance is ' + this.balance + ' :)')


let james = new WellsFargo('James',100)
let josh = new WellsFargo('Josh',200)

james.deposit(28)
josh.withdraw(200)

func printBalances()
  james.printBalance()
  josh.printBalance()

printBalances()

console.log('\n')

let numbers = [1,2,3,4]
let i = 0

loopUntil i < numbers.length
  console.log(numbers[i])
  i+=1
