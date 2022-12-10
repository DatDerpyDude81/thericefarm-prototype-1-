"use strict";
// the technical part of the rice farming game
var drought=false
var startup = document.getElementById("startup")
var game = document.getElementById("game")
var tiles = document.getElementsByClassName("tile")
var fertilizer = document.getElementById("fertilizer")
var moneyAmount = document.getElementById("money")
var sellRice = document.getElementById("sell")
var buyPlainSeeds = document.getElementById("buyplain")
var seedAmount = document.getElementById("seedamount")
var shop = document.getElementsByClassName("shopbutton")
var riceAmount = document.getElementById("riceamount")
var getBoosted = document.getElementById("buyboost")
var waterAmount = document.getElementById("water")
var buyWater = document.getElementById("buywater")
var hasFertile = false
var deleteData = document.getElementById("delete")
var usefert = document.getElementById("usefert")
var notusefert = document.getElementById("notusefert")
var mansave = document.getElementById("manualsave")
var buyworker= document.getElementById("buyworker")

Object.defineProperties(Array.prototype, {
  count: {
    value: function(value) {
      return this.filter(x => x == value).length;
    }
  }
});
// the array chances has 2048 individual items—a reference to the game '2048'
var chances = [40000]
for (let i = 0; i < 12; i++) {
  chances.push(0)
}
for (let i = 0; i < 40; i++) {
  chances.push(1)
}
for (let i = 0; i < 1931; i++) {
  chances.push(2)
}
for (let i = 0; i < 64; i++) {
  chances.push(4)
}
function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}
shuffle(chances)
if (Number.isInteger(parseFloat(localStorage.getItem("rice")))) {
  var rice = parseFloat(localStorage.getItem("rice"))
} else {
  var rice = 10
}
if (Number.isInteger(parseFloat(localStorage.getItem("fertilizer")))) {
  var fertile = parseFloat(localStorage.getItem("fertilizer"))
} else {
  var fertile = 5
}
if (Number.isInteger(parseFloat(localStorage.getItem("seeds")))) {
  var seeds = parseFloat(localStorage.getItem("seeds"))
} else {
  var seeds = 40
}

if (Number.isInteger(parseFloat(localStorage.getItem("money")))) {
  var money = parseFloat(localStorage.getItem("money"))
} else {
  var money = 20
}
if (Number.isInteger(parseFloat(localStorage.getItem("water")))) {
  var water = parseFloat(localStorage.getItem("water"))
} else {
  var water = 40
}


class Rice {
  constructor(type, seconds, successRate, using) {
    this.type = type
    this.seconds = seconds
    this.successRate = parseFloat(successRate)
    this.using = using
  }
  get successful() {
    return this.success()
  }
  success() {
    let isSuccess = Math.random()
    let successfulChance = 1 - this.successRate
    if (this.successRate == 1) {
      return true
    } else {
      if (isSuccess < successfulChance) {
        return true
      } else {
        return false
      }
    }
  }
}

var plain = new Rice("plain", 5, 1, true)


function dialog(message) {
  let dwrap = document.getElementById("dialogs")
  let extraheight = 0
  if (dwrap.hasChildNodes()) {
    for (let i = 0; i < dwrap.children.length; i++) {
      extraheight += dwrap.children[i].clientHeight
    }
  }
  let d = document.createElement("div")
  let x = document.createElement("span")
  d.style.background = "rgb(0, 240, 255)"
  d.style.border = "1px solid rgb(0, 175, 255)"
  d.style.opacity = 0.9
  d.style.margin = "0px 5px 5px 0px"
  d.style.animationName = "fadeout"
  d.style.top = -extraheight
  d.style.float = "right"
  d.style.animationDuration = "2s"
  d.style.animationDelay = "5s"
  d.style.width = "fit-content"
  d.style.padding = "10px"
  d.style.textAlign = "center"
  d.style.fontFamily = "JetBrains Mono, monospace"
  d.style.borderRadius = "3px"
  x.style.color = "rgb(0, 100, 255)"
  x.innerHTML = message + " <a onclick=\"this.parentNode.parentNode.remove();\">×</a>"
  d.addEventListener("animationend", function clearDialog() {
    d.remove()
  })
  d.appendChild(x)
  dwrap.appendChild(d)
  dwrap.appendChild(document.createElement("br"))
}
document.documentElement.addEventListener("click", function clicktocontinue() {
  startup.style.display = "none"
  game.style.display = "inline"
  document.documentElement.style.backgroundImage = "url('/img/startbackgroundblurred.png')"
  document.documentElement.removeEventListener("click", clicktocontinue)
})

deleteData.addEventListener("click", function deleteThingy() {
  let wantToDelete = confirm("WARNING! You are now about to delete all your data associated with this game. Click OK to continue, and if you didn't mean to do this, click Cancel.")
  if (wantToDelete == true) {
    clearInterval(updateStorage)
    alert("Your data was successfully cleared.")
    localStorage.clear()
    location.reload()
  } else {
    alert("Your data was not cleared.")
  }
})

mansave.addEventListener("click", function manualSave() {
  dialog("Your data has been saved")
  localStorage.setItem("rice", rice.toString())
  localStorage.setItem("seeds", seeds.toString())
  localStorage.setItem("money", money.toString())
  localStorage.setItem("fertilizer", fertile.toString())
  localStorage.setItem("water", water.toString())
})


for (let i = 0; i < tiles.length; i++) {
  let tile = tiles[i]
  tile.innerHTML = "Empty soil"
  tile.style.backgroundImage = "url(\"/img/emptysoil.jpg\")"
  tile.addEventListener("click", function main() {
    if (tile.style.backgroundImage == "url(\"/img/emptysoil.jpg\")" && seeds > 0 && water > 0) {
      tile.style.backgroundImage = "url(\"/img/ricegrowing.jpg\")"
      seeds--
      water--

      if (plain.using) {
        if (hasFertile) {
          var harvestSeconds = plain.seconds - 3
          fertile--
        } else {
          var harvestSeconds = plain.seconds
        }
        tile.innerHTML = plain.type.toUpperCase() + " rice is growing!<br>Ready in " + harvestSeconds.toString()
        var harvesting = setInterval(() => {
          if (harvestSeconds > 0) {
            harvestSeconds--
            tile.innerHTML = plain.type.toUpperCase() + " rice is growing!<br>Ready in " + harvestSeconds.toString()
          } else {
            tile.style.backgroundImage = "url(\"/img/riceready.jpg\")"
            tile.innerHTML = plain.type.toUpperCase() + " rice is ready!"
            tile.addEventListener("click", function addrice() {
              let amountToAdd = chances[Math.floor(Math.random() * chances.length)]
              rice = rice + amountToAdd
              tile.removeEventListener("click", addrice)
              tile.innerHTML = "Empty soil"
              tile.style.backgroundImage = "url(\"/img/emptysoil.jpg\")"
            })
            clearInterval(harvesting)
          }
        }, 1000)
      }

    } else if (tile.style.backgroundImage == "url(\"/img/emptysoil.jpg\")" && seeds <= 0 || water <= 0) {
      dialog("No seeds/water left! Buy some more in the market.")
    }
    return;
  })
}

sellRice.addEventListener("click", function sell() {
  if (rice >= 2) {
    let howMany = prompt("How much rice would you like to sell? Type a number, or type 'all' if you would like to sell all of your harvested rice (2 rice sold = 1元)")
    if (Number.isInteger(parseFloat(howMany))) {
      if (parseFloat(howMany) > rice) {
        alert("You are trying to sell more rice than you have! Please try again.")
      } else if (parseFloat(howMany) < 2) {
        alert("You cannot sell less than 2 rice at a time!")
      } else {
        money = money + Math.round(parseFloat(howMany) / 2)
        let sold = Math.round(parseFloat(howMany) / 2)
        alert(howMany.toString() + " rice sold successfully for " + sold.toString() + "元!")
        rice -= parseFloat(howMany)
      }
    } else if (howMany.toString() == "all") {
      money = money + Math.round(rice / 2)
      let sold = Math.round(rice / 2)
      alert("All rice sold successfully for " + sold + "元!")
      rice -= rice
    } else {
      alert("Sorry, not an integer value! Click the sell button again to resell.")
    }
  } else {
    alert("You don't have enough rice to sell!! Go and farm some more!")
  }
})

buyPlainSeeds.addEventListener("click", function buyPlain() {
  if (money > 0) {
    let howMuchBuy = prompt("How many plain rice seeds do you wish to buy? Remember that 1元 = 4 seeds.")
    if (Number.isInteger(parseFloat(howMuchBuy))) {
      if (parseFloat(howMuchBuy) / 4 > money || parseFloat(howMuchBuy) < 4) {
        alert("You are EITHER trying to purchase more rice seeds than the amount you can afford, OR you inputted a value less than 4! Please try again.")
      } else {
        money -= Math.round(parseFloat(howMuchBuy) / 4)
        seeds += Math.round(parseFloat(howMuchBuy))
        let spent = Math.round(parseFloat(howMuchBuy) / 4)
        alert("Successfully bought " + howMuchBuy + " PLAIN rice seeds for " + spent.toString() + "元!")
      }
    } else {
      alert("Not integer input! Please try again.")
    }
  } else {
    alert("No money left! Go farm some rice!")
  }
})


getBoosted.addEventListener("click", function buyElBoost() {
  if (money > 1) {
    let howMuch = prompt("Please write how much fertilizer you would like to buy (recommend reading the info on the fertilizer):")
    if (Number.isInteger(parseFloat(howMuch))) {
      if (parseFloat(howMuch) < 1 || parseFloat(howMuch) * 2 > money) {
        alert("You are trying to buy more than you can afford, OR you are trying to buy negative/zero fertilizer! Try again.")
      } else {
        money = money - Math.round(parseFloat(howMuch) * 2)
        fertile = fertile + (parseFloat(howMuch))
        let spent = Math.round(parseFloat(howMuch) * 2)
        alert("You have successfully purchased " + howMuch + " fertilizer for " + spent.toString() + "元!")
      }
    } else {
      alert("Not integer value! Try again.")
    }
  } else {
    alert("Not enough money! You need at least 2元.")
  }
})

buyWater.addEventListener("click", function buyWater() {
  if (money > 0) {
    let howMuchWater = prompt("How many liters of water do you wish to buy? Remember that 1元 = 2 liters of water.")
    if (Number.isInteger(parseFloat(howMuchWater))) {
      if (parseFloat(howMuchWater) / 2 > money || parseFloat(howMuchWater) < 2) {
        alert("You are EITHER trying to purchase more water than the amount you can afford, or you inputted a negative/zero value!! Please try again.")
      } else {
        money -= Math.round(parseFloat(howMuchWater) / 2)
        water += Math.round(parseFloat(howMuchWater))
        let spent = Math.round(howMuchWater / 2)        
        alert("Successfully bought " + howMuchWater + " liters of water for " + spent.toString() + "元!")
      }
    } else {
      alert("Not integer input! Please try again.")
    }
  } else {
    alert("No money left! Go farm some rice!")
  }
})

usefert.addEventListener("click", function checkfert() {
  if (fertile > 0 && notusefert.disabled == true) {
    let confirmUse = confirm("You are now going to activate the automatic usage of fertilizer. 1 fertilizer will be used per rice planting to speed up harvest time by 3 seconds.")
    if (confirmUse == true) {
      alert("Fertilizer use has been activated.")
      hasFertile = true
    } else {
      alert("Fertilizer use remains deactivated.")
    }
  } else if (fertile <= 0) {
    alert("You have no fertilizer! Buy some more in the market.")
  }
})

notusefert.addEventListener("click", function notfert() {
  if (usefert.disabled == true && fertile > 0) {
    let confirmUse = confirm("You are now going to DEACTIVATE the automatic usage of fertilizer. 1 fertilizer will now NOT be used per rice planting to speed up harvest time by 3 seconds.")
    if (confirmUse == true) {
      alert("Fertilizer use has been deactivated.")
      hasFertile = false
    } else {
      alert("Fertilizer use remains activated.")
    }
  } else {
    alert("You have no fertilizer! Get some by buying some from the market.")
  }
})

function update() {
  riceAmount.innerHTML = "Rice: " + rice.toString()
  seedAmount.innerHTML = "Seeds left: " + seeds.toString()
  moneyAmount.innerHTML = "Money: " + money.toString() + "元"
  fertilizer.innerHTML = "Fertilizer: " + fertile.toString()
  waterAmount.innerHTML = "Water left: " + water.toString() + " liters"
  if (fertile <= 0) {
    hasFertile = false
    notusefert.innerHTML = "Deactivated"
    notusefert.disabled = true
    usefert.innerHTML = "Cannot activate"
    usefert.disabled = true
  } else if (hasFertile == false && fertile > 0) {
    notusefert.innerHTML = "Deactivated"
    notusefert.disabled = true
    usefert.innerHTML = "Activate fertilizer"
    usefert.disabled = false
  } else if (hasFertile == true && fertile > 0) {
    usefert.innerHTML = "Activated"
    usefert.disabled = true
    notusefert.innerHTML = "Deactivate fertilizer"
    notusefert.disabled = false
  }
  if (rice < 2) {
    sellRice.disabled = true
  } else {
    sellRice.disabled = false
  }
  if (water <= 0 && seeds <= 0 && rice <= 0 && money <= 0) {
    alert("Uh oh! You have reached 0 rice, 0 water, 0 seeds, and 0 money! Now you cannot do anything! Fortunately, your data can be reset, so reset your data, and continue playing!")
  }
  
  
  return;
}
var updating = setInterval(update, 60)
var updateStorage = setInterval(() => {
  dialog("Data has been autosaved in localStorage")
  localStorage.setItem("rice", rice.toString())
  localStorage.setItem("seeds", seeds.toString())
  localStorage.setItem("money", money.toString())
  localStorage.setItem("fertilizer", fertile.toString())
  localStorage.setItem("water", water.toString())
  

}, 180000)
var startDrought = setInterval(() => {
    let chance= Math.floor(Math.random() * 100)
    if (chance == 1 && drought==false) { // for testing
      alert("A DROUGHT HAS STARTED!")
      drought=true
      plain.successRate -= 0.5
      plain.seconds *= 2
      let droughtTime = setTimeout(() => {
        clearTimeout(droughtTime)
      }, 180000)
      
    }
}, 15000)