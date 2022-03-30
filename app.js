async function App() {
    let tickets = [];
    let stop = false;
    const searchId = await getId();
    await getTickets();
    async function getId() {
        try{
            let response = await fetch('https://front-test.beta.aviasales.ru/search');
            if (!response.ok) {
                const message = response.status;
                console.error(message)
            }
            const json = await response.json();
            const result = await json.searchId;
            return result;
        }
        catch(e) {
            console.log(e.message);
        }
    }
    async function getTickets() {
        if (stop === false) {
            let response = await fetch(`https://front-test.beta.aviasales.ru/tickets?searchId=${searchId}`)
            if (response.status === 502 || response.status === 500) {
                await getTickets();
            } else if (response.status !== 200) {
                console.error(response.statusText);
                await new Promise(resolve => setTimeout(resolve, 1000));
                await getTickets();
            } else {
                let data = await response.json();
                tickets = tickets.concat(data.tickets);
                console.log(data);
                if (data.stop) {
                    stop = true;
                }
                await getTickets();
            }
        }
        else {
            document.querySelector("fieldset").removeAttribute("disabled");
            document.querySelector(".tickets").classList.remove('visible');
        }
    }
    function startSort(){
        if (buttons[0].classList.contains('tab_active')) {
            sortTickets(ticketsCheap);
        } else {
            sortTickets(ticketsFast);
        }
    }
    function buttonsSwitch() {
        if (buttons[0].classList.contains('tab_active')) {
            buttons[0].classList.remove('tab_active');
            buttons[1].classList.add('tab_active');
            checkboxes.forEach(item => {
                if (item.checked === true){
                    helperArr.push(item.name);
                }
            });
            arrSorter();
        } else {
            buttons[1].classList.remove('tab_active');
            buttons[0].classList.add('tab_active');
            checkboxes.forEach(item => {
                if (item.checked === true){
                    helperArr.push(item.name);
                }
            });
            arrSorter();
        }
        helperArr.splice(0,helperArr.length);
    }
    function contains(arr, elem) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] === elem) {
                return true;
            }
        }
        return false;
    }
    function arrSorter() {
        let a0 = -1,a1 = -1,a2 = -1,a3 = -1;
        if (contains(helperArr, "zero")){
            a0=0;
        }
        if (contains(helperArr, "one")){
            a1=1;
        }
        if (contains(helperArr, "two")){
            a2=2;
        }
        if (contains(helperArr, "three")){
            a3=3;
        }
        if (a0===-1 && a1===-1 && a2===-1 && a3===-1){
            startSort();
        }
        else if (buttons[0].classList.contains('tab_active')){
            let arr = ticketsCheap.filter(item => {
                if ((item.segments[0].stops.length === a0 || item.segments[0].stops.length === a1 ||
                        item.segments[0].stops.length === a2 || item.segments[0].stops.length === a3) &&
                    (item.segments[1].stops.length === a0 || item.segments[1].stops.length === a1 ||
                        item.segments[1].stops.length === a2 || item.segments[1].stops.length === a3)) {
                    return item;
                }
            });
            sortTickets(arr);
        }
        else {
            let arr = ticketsFast.filter(item => {
                if ((item.segments[0].stops.length === a0 || item.segments[0].stops.length === a1 ||
                        item.segments[0].stops.length === a2 || item.segments[0].stops.length === a3) &&
                    (item.segments[1].stops.length === a0 || item.segments[1].stops.length === a1 ||
                        item.segments[1].stops.length === a2 || item.segments[1].stops.length === a3)) {
                    return item;
                }
            });
            sortTickets(arr);
        }
    }
    function timeEditor(arr, i, seg){
        let hoursStart = new Date(arr[i].segments[seg].date).getHours();
        let minutesStart = new Date(arr[i].segments[seg].date).getMinutes();
        let timeFinish = new Date(arr[i].segments[seg].date);
        timeFinish = new Date(timeFinish).setMinutes(minutesStart + arr[i].segments[seg].duration);
        let hoursFinish = new Date(timeFinish).getHours();
        let minutesFinish = new Date(timeFinish).getMinutes();
        if (hoursStart < 10) {
            hoursStart = `0${hoursStart.toString()}`;
        }
        if (minutesStart < 10) {
            minutesStart = `0${minutesStart.toString()}`;
        }
        if (hoursFinish < 10) {
            hoursFinish = `0${hoursFinish.toString()}`;
        }
        if (minutesFinish < 10) {
            minutesFinish = `0${minutesFinish.toString()}`;
        }
        return `${hoursStart}:${minutesStart} - ${hoursFinish}:${minutesFinish}`;
    }
    function durationEditor(arr, i, seg){
        let hours = Math.trunc(arr[i].segments[seg].duration/60);
        let minutes = arr[i].segments[seg].duration%60;
        if (hours < 10) {
            hours = `0${hours.toString()}`;
        }
        if (minutes < 10) {
            minutes = `0${minutes.toString()}`;
        }
        return `${hours}ч ${minutes}м`
    }
    function stopsEditor(arr, i, seg){
        if (arr[i].segments[seg].stops.length === 0){
            return "Без пересадок"
        }
        else if(arr[i].segments[seg].stops.length === 1){
            return "1 пересадка"
        }
        else{
            return `${arr[i].segments[seg].stops.length} пересадки`
        }
    }
    function sortTickets(arr) {
        let i = 0;
        document.querySelectorAll('.t_logo').forEach(item => {
            item.setAttribute("src", `https://pics.avs.io/99/36/${arr[i].carrier}.png`)
            i++;
        });
        i = 0;
        document.querySelectorAll('.ticket_price').forEach(item =>{
            item.innerHTML = `${arr[i].price.toString().replace(/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g, "$1" + ' ')} Р`;
            i++;
        });
        i = 0;
        document.querySelectorAll('.path1').forEach(item =>{
            item.innerHTML = `${arr[i].segments[0].origin} - ${arr[i].segments[0].destination}`;
            i++;
        });
        i = 0;
        document.querySelectorAll('.time1').forEach(item =>{
            item.innerHTML = timeEditor(arr, i ,0);
            i++;
        });
        i = 0;
        document.querySelectorAll('.duration1').forEach(item =>{
            item.innerHTML = durationEditor(arr, i, 0);
            i++;
        });
        i = 0;
        document.querySelectorAll('.sort_tag1').forEach(item =>{
            item.innerHTML = stopsEditor(arr, i, 0);
            i++;
        });
        i = 0;
        document.querySelectorAll('.countries1').forEach(item =>{
            item.innerHTML = arr[i].segments[0].stops.join(', ');
            i++;
        });
        i = 0;
        document.querySelectorAll('.path2').forEach(item =>{
            item.innerHTML = `${arr[i].segments[1].origin} - ${arr[i].segments[1].destination}`;
            i++;
        });
        i = 0;
        document.querySelectorAll('.time2').forEach(item =>{
            item.innerHTML = timeEditor(arr, i ,1);
            i++;
        });
        i = 0;
        document.querySelectorAll('.duration2').forEach(item =>{
            item.innerHTML = durationEditor(arr, i, 1);
            i++;
        });
        i = 0;
        document.querySelectorAll('.sort_tag2').forEach(item =>{
            item.innerHTML = stopsEditor(arr, i, 1);
            i++;
        });
        i = 0;
        document.querySelectorAll('.countries2').forEach(item =>{
            item.innerHTML = arr[i].segments[1].stops.join(', ');
            i++;
        });
    }

    const buttons = document.querySelectorAll('.tabs_el');
    const checkboxes = document.querySelectorAll('.checkbox');
    let sum = 0;
    let helperArr = [];
    let ticketsCheap = tickets.slice().sort((prev, next) => {
        return prev.price - next.price;
    });
    let ticketsFast = tickets.slice().sort((prev, next) => {
        return (prev.segments[0].duration + prev.segments[1].duration) - (next.segments[0].duration + next.segments[1].duration);
    });
    buttons.forEach(item => {
        item.addEventListener('click', e => {
            if (!e.currentTarget.classList.contains('tab_active')) {
                buttonsSwitch();
            }
        });
    });
    checkboxes.item(0).checked = true;
    checkboxes.forEach(item => {
        item.addEventListener('click', e => {
            if (e.target.checked) {
                if(e.target.name === "all") {
                    helperArr.splice(0, helperArr.length);
                    for(let i=1; i<checkboxes.length; i++){
                        checkboxes.item(i).checked = false;
                    }
                }
                else {
                    checkboxes.item(0).checked = false;
                }
                checkboxes.forEach(item => {
                    if(item.checked === true){
                        helperArr.push(item.name);
                    }
                });
                e.target.checked = true;
                item.checked = true;
                arrSorter();
            } else {
                e.target.checked = false;
                item.checked = false;
                checkboxes.forEach(item => {
                    if (item.checked === true){
                        sum++;
                        helperArr.push(item.name);
                    }
                });
                if (sum === 0){
                    checkboxes.item(0).checked = true;
                    startSort();
                }
                arrSorter();
            }
            sum = 0;
            helperArr.splice(0, helperArr.length);
        });
    });

    sortTickets(ticketsCheap);
}
App();

