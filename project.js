let profiles = [];
let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
let currentprofile;
let currentcoin = 2;
let currentday = 1;
let currentCalculation = "buy";
var exit;
let storedData = localStorage.getItem("profiles");
profiles = storedData ? JSON.parse(storedData) : [];

$(function () {
    $("#addDiv").hide();
    $("#overlay").hide();
    $("#secondpage").hide();


    loadProfiles();

    $("#newprofile").on("click", function () {
        $("#overlay").fadeIn(200);
        $("#addDiv").fadeIn(200);
        $("#profilename").focus();
        $("#profilename").val("");
    });

    $("#addbtn").on("click", function () {
        let profilename = $("#profilename").val().trim();

        if (profilename) {
            profiles.push({
                username: profilename, money: 1000, currentdollar: 1000, wallet: [

                    { name: "Cordana", amount: 0, coinindex: 0 },
                    { name: "Avalanche", amount: 0, coinindex: 1 },
                    { name: "Bitcoin", amount: 0, coinindex: 2 },
                    { name: "Dogecoin", amount: 0, coinindex: 3 },
                    { name: "Ethereum", amount: 0, coinindex: 4 },
                    { name: "Polygon", amount: 0, coinindex: 5 },
                    { name: "Synthetix", amount: 0, coinindex: 6 },
                    { name: "Tron", amount: 0, coinindex: 7 },
                    { name: "Ripple", amount: 0, coinindex: 8 },

                ]
            });
            saveProfiles();
            loadProfiles();
            $("#overlay").fadeOut(200);
            $("#addDiv").fadeOut(200);
        }
        else {
            alert("Enter a name");
        }

    })





    $("#overlay").on("click", function (e) {
        $("#overlay").fadeOut(200);
        $("#addDiv").fadeOut(200);

    })

    $("body").on("click", ".delete", function () {
        let indx = $(this).closest("li").index();
        profiles.splice(indx, 1);
        saveProfiles();
        loadProfiles();
        e.stopPropagation();
    })

    $("body").on("click", ".profiles", function () {
        currentprofile = $(this).index()
        $("#firstpage").hide();
        setSecondPage();
        $("#secondpage").show();
        displaywallet()
        e.stopPropagation();

    })

    $("#logout").on("click", function () {
        $("#firstpage").show();
        $("#secondpage").hide();
        $(".cimg").removeClass("heartbeat")
        currentcoin = 2;
    })

    let timer = null;
    $("#btnPlay").on("click", function () {
        if (timer === null) {
            timer = setInterval(incCounter, 1000);
            $(this).find("img").attr("src", "./images/pause-38.png");

        } else {
            clearInterval(timer)
            $(this).find("img").attr("src", "./images/play-button-6.png");
            timer = null;
        }
    })

    $("#nextDay").on("click", function () {
        incCounter();
    })

    $(".cimg").on("click", function () {
        $(".cimg").removeClass("heartbeat")
        currentcoin = $(this).index();
        setSecondPage();
    })

    $("#buy").on("click", function () {
        currentCalculation = "buy";
        $(this).css({
            "background-color": "green",
            "color": "white",
        });
        $("#sell").css({
            "color": "grey",
            "background-color": "white"
        });
        $("#buybutton").css("background-color", "green");
        setSecondPage()
    })

    $("#sell").on("click", function () {
        currentCalculation = "sell";
        $(this).css({
            "background-color": "red",
            "color": "white",
        });
        $("#buy").css({
            "color": "grey",
            "background-color": "white"
        });
        $("#buybutton").css("background-color", "red");
        setSecondPage()
    })


    $("#amount2").on("keydown keyup", function (e) {

        if (e.type == "keyup") {
            var priceamount = parseFloat($("#amount2").val() * exit)
            $("#result2").text(priceamount);
        }
        e.stopPropagation();
    })

    $("#buybutton").on("click", function () {
        if (currentCalculation == "buy") {
            var priceamount = Number($("#result2").text())
            if (priceamount > profiles[currentprofile].currentdollar || isNaN(priceamount) || priceamount == "")
                alert("Enter a proper amount")
            else {

                profiles[currentprofile].wallet[currentcoin].amount += Number($("#amount2").val())
                profiles[currentprofile].currentdollar -= priceamount
                saveProfiles()
                setSecondPage()
                displaywallet()

            }
        }
        else {
            let amountinpt = $("#amount2").val()
            if (amountinpt > profiles[currentprofile].wallet[currentcoin].amount || isNaN(amountinpt) || amountinpt == "")
                alert("Enter a proper amount")
            else {
                profiles[currentprofile].wallet[currentcoin].amount -= amountinpt
                profiles[currentprofile].currentdollar += Number($("#result2").text())
                saveProfiles()
                setSecondPage()
                displaywallet()
            }
        }
    })


    $("body").on("mouseenter", ".bar", function () {
        let indx = parseInt($(this).attr("id"))
        $("#coininfo").text(`Date: ${market[indx].date}, Open: $${market[indx].coins[currentcoin].open}, Close: $${market[indx].coins[currentcoin].close}, High: $${market[indx].coins[currentcoin].high}, Low: $${market[indx].coins[currentcoin].low}`)
    })

    $("body").on("mouseleave", ".bar", function () {

        $("#coininfo").text("")
    })


})

function loadProfiles() {
    if (profiles.length === 0) {
        $("#empty").show();
    }
    else {
        $("#empty").hide();
    }
    const profileContainer = $("#profilecontainer ul");
    profileContainer.empty();
    profiles.forEach((profile) => {
        profileContainer.append(
            `<li class="profiles"">
                    <img src="./images/12-512.webp" alt="">
                    <p>${profile.username}</p>
                    <div class="delete">x</div>
                </li>`
        );

    });
}

function setSecondPage() {

    $("#pname").text(profiles[currentprofile].username)
    $(".cimg").eq(currentcoin).addClass("heartbeat")
    $("#selectedimg").attr("src", `./images/${coins[currentcoin].code}.png`)
    $("#cname").text(coins[currentcoin].name)

    if (currentCalculation == "buy") {
        $("#buyorsell").text("Buy")
    }
    else {
        $("#buyorsell").text("Sell")
    }
    $("#coinname").text(coins[currentcoin].name.toUpperCase())
    $("#result2").text("")
    $("#amount2").val("")
    $("#money").text("$" + (profiles[currentprofile].money).toFixed(2))

    drawChart();
    saveProfiles();
}


function saveProfiles() {
    localStorage.setItem("profiles", JSON.stringify(profiles));
}

function incCounter() {
    if (currentday + 2 <= 365) {
        $("#counter").text(currentday + 2);
        let dts = market[currentday + 1].date.split("-")
        $("#date").text(`${dts[0]} ${months[parseInt(dts[1]) - 1]} ${dts[2]}`);
        currentday++;
        displaywallet()
        setSecondPage()
    }
    else {
        $("#money").addClass("heartbeat")
        $("#firsttable").remove()
        $("#secondtable").css("width", "100%")
    }

}

function drawChart() {
    $("#chart").empty();
    let x = 0;
    let chartmin = market[0].coins[currentcoin].low;
    let chartmax = market[0].coins[currentcoin].high;

    const startDay = currentday > 95 ? currentday - 95 : 0;


    for (let i = 0; i < currentday; i++) {
        chartmin = Math.min(chartmin, market[i].coins[currentcoin].low);
        chartmax = Math.max(chartmax, market[i].coins[currentcoin].high);
    }

    const divide = chartmax - chartmin || 1;


    for (let i = startDay; i < currentday; i++) {
        let entry = market[i].coins[currentcoin].open;
        exit = market[i].coins[currentcoin].close;
        let max = market[i].coins[currentcoin].high;
        let min = market[i].coins[currentcoin].low;

        let stickHeight = (max - min) / divide * 150;
        var barHeight = Math.abs(entry - exit) / divide * 150;
        let bottomnew = (min - chartmin) / divide * 150;
        var barPos = (Math.min(entry, exit) - chartmin) / divide * 150;
        var color = entry < exit ? "green" : "red";

        x += 10;
        $("#chart").append(
            `<div class='stick' style='height: ${stickHeight}px; bottom: ${bottomnew + 50}px; left: ${x}px'></div>`
        );
        $("#chart").append(
            `<div class='bar' id='${i}' style='background:${color}; bottom:${barPos + 50}px; left:${x - 3}px; height: ${barHeight}px;'></div>`
        );
    }
    if (color === "green") {
        barPos += barHeight;
    }
    $("#chart").append(
        `<div id="closeLine" style='bottom:${barPos + 50}px;'>$${exit}</div>`
    );

    $("#chart").append(
        `<div class="maxmin" style='bottom:${280}px;'>$${Math.floor(chartmax * 0.1) + chartmax}</div>`
    );

    $("#chart").append(
        `<div class="maxmin" style='bottom:${0}px;'>$${chartmin - Math.floor(chartmin * 0.1)}</div>`
    );



}

function displaywallet() {
    $(".wallet").remove()
    let totalprice = 0


    profiles[currentprofile].wallet.forEach(element => {
        if (element.amount != 0) {
            if (currentday > 1)
                totalprice += (element.amount * market[currentday - 1].coins[element.coinindex].close)

            $("#secondtable").append(`<tr class="wallet">
                <td><img src="./images/${coins[element.coinindex].image}" alt="">${coins[element.coinindex].name}</td>
                <td>${element.amount}</td>
                <td>${element.amount * market[currentday - 1].coins[element.coinindex].close}</td>
                <td>${market[currentday - 1].coins[element.coinindex].close}</td>
            </tr>`)

        }
    });

    $("#curmoney").text("$" + (profiles[currentprofile].currentdollar))
    profiles[currentprofile].money = totalprice + profiles[currentprofile].currentdollar


}





