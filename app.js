 // BUDGET CONTROLLER
var budgetController = (function(){

    var Expenses = function(id,description,value){
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
    };

    Expenses.prototype.calcPercentage = function(totalInc){
      if(totalInc > 0 ) {
        this.percentage = Math.round((this.value / totalInc) * 100);
      }else {
         this.percentage = -1;
      }   
    };

   Expenses.prototype.getPercentage = function(){
       return this.percentage;
   };


   
    var Income =  function(id,description,value){
      this.id = id;
      this.description = description;
      this.value = value;
    };

    var calculateTotal = function(type){
       var sum = 0;
       data.allItems[type].forEach(function(cur){
         sum += cur.value;
       });
       data.totals[type] = sum;
    };

    var data = {
       allItems : {
          inc:[],
          exp:[]
       },
       totals:{
          inc: 0,
          exp: 0
       },
       budget: 0,
       percentage: -1
    };

  return {
  addItem: function(type,des,val){
     var newItem,ID;

      if(data.allItems[type].length > 0) {
         // create new id
         ID = data.allItems[type][data.allItems[type].length - 1].id  + 1 ;
        }else{
           ID = 0;
        }
       // create new items based on 'inc' or 'exp' type
          if(type === 'exp'){
          newItem = new Expenses(ID,des,val);
          } else if(type === 'inc'){
           newItem = new Income(ID,des,val);
          }
          //Push it into our data structure
          data.allItems[type].push(newItem);
          // return the new element
          return newItem;
       },
       deleteItems : function(type, id){
           var ids, index;
         // id = 2
         // data.allItems[type][id];
         // ids = [1 2 4 6 8]    [0 2]
         // index = 3

         ids = data.allItems[type].map(function(current) {
               return current.id;
              });

         index = ids.indexOf(id);
       
         if(index !== -1) {
          data.allItems[type].splice(index, 1);
         }
      
      },
         calculatePercentages : function(){
           /*
            a =20 
            b =10 
            c = 40
            income = 100
            a = 20 / 100 = 20%
            b = 10 / 100 = 10%
            c = 40 / 100 = 40%
           */
          data.allItems.exp.forEach(function (cur){
             cur.calcPercentage(data.totals.inc);
          });
         },

         getPercentage : function(){
            var allPerc = data.allItems.exp.map(function(cur){
               return cur.getPercentage();
            });
            return allPerc;
         },

        calculateBudget: function(){
          // calculate total income and expenses
             calculateTotal('exp');
             calculateTotal('inc');

          //calculate the budget : income - expenses
             data.budget = data.totals.inc - data.totals.exp;

          //calculate the percentage we spent
            if(data.totals.inc > 0 )
            {
               data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
               data.percentage = -1;
            }
           
        },
         updatePercentages: function(){


         },
         getBudget: function(){
             return {
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage: data.percentage
             };
         },     
   };

})();


// UI CONTROLLER
var UIController = (function(){

 DOMstrings = {
   inputType: '.add__type',
   inputDescription: '.add__description',
   inputValue: '.add__value',
   inputBtn: '.add__btn',
   incomeContainer: '.income__list',
   expensesContainer: '.expenses__list',
   budgetLabel : '.budget__value',
   expensesLabel : '.budget__expenses--value',
   incomeLabel : '.budget__income--value',
   percentageLabel : '.budget__expenses--percentage',
   container: '.container',
   expensesPercLabel : '.item__percentage',
   dateLabel : '.budget__title--month'
 
};

var formatNumber = function(num, type) {
   var numSplit,int,dec;
     /*
    + or - before number
    exactly 2 decimals points 
    comma separating the thousands
    2310.4567 -> + 2,310.46
    20000 -> + 2,000.00
    */

   num = Math.abs(num);     // change the ngtv to postveg (-4000) -> 4000               
  
   num = num.toFixed(2);    // add two decimal at last  2310.4567 -> + 2,310.46
                                                      
  numSplit = num.split('.'); // convert into array ['int','float]
  
  int = numSplit[0];  
   if(int.length > 3) {
      int = int.substr(0,int.length - 3) + ',' + int.substr(int.length -3, 3); // input : 23510
           // output : 23,510

   }
  
  dec = numSplit[1];

 
  return  (type === 'exp' ? '-' :  '+') + ' ' + int + '.' + dec;

  };

// creating own foreach function for nodelist instead of array.
var nodeListForEach = function(list, callback){
   for(var i = 0; i<list.length; i++){
         callback(list[i], i);  
   }
};


   return {
          getInput :  function() {
              return {
               type : document.querySelector(DOMstrings.inputType).value,             //either it is expenses or income
               description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value) 
                    };  
             },

             addlistItem : function(obj, type){
                var html , newHtml,element;
               //Create HTML Sting  with placeholder text
                 
                if(type === 'inc')
                   {    
                    element = DOMstrings.incomeContainer;
                    html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                   } else if (type === 'exp') {
                      element = DOMstrings.expensesContainer;
                    html = ' <div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                   }

              //Replace the placeholder text with some actual data
               
              newHtml = html.replace('%id%',obj.id);
              newHtml = newHtml.replace('%description%',obj.description);
              newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

              //Insert the HTML into the DOM

             document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
             },

            deleteListItem: function(selectorID){
             var el = document.getElementById(selectorID);
                el.parentNode.removeChild(el);
            },


             clearFields : function(){
                var fields, fieldsArr;

             fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);  // store the value in list in fields var

             fieldsArr = Array.prototype.slice.call(fields);      // slice converts the list into array

             fieldsArr.forEach(function(current, index, array) {
                current.value = "";
             });

             fieldsArr[0].focus();         //  add bar in 1st 
            },
               displayBudget : function(obj){
                  var type;

                   obj.budget > 0 ? type = 'inc': type = 'exp';

               document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
               document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'inc') ;
               document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'exp') ;
               if(obj.percentage > 0) {
                  document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%' ;
               }else {
                  document.querySelector(DOMstrings.percentageLabel).textContent = '---';
               }
            
            },
           
            displayPercentages: function(percentages) {
               var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

               nodeListForEach(fields , function(current, index) {
                   
                  if(percentages[index] > 0) {
                     current.textContent = percentages[index] + '%';
                  }else{
                     current.textContent = '---';
                  }
                
               });

            },

            displayMonth: function(){
               var now, year, month,months;

              now = new Date();
              months = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'];
              month = now.getMonth();
              year = now.getFullYear();
     

              document.querySelector(DOMstrings.dateLabel).innerHTML = months[month] + ' ' + year;
              
            },
            changedType: function(){
              var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
         
              nodeListForEach(fields ,function(cur){
                 cur.classList.toggle('red-focus');
              });
              document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            },

              getDOMstrings : function() {
               return DOMstrings;
              }
                    
        };
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
   
   var setupEventListener = function(){

         var DOM = UICtrl.getDOMstrings();
         document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItems);
         // It is for when user press enter key and which value is 13.
         document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                 ctrlAddItems();
            }
         });
           document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItems);

           document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
      };
      
      
   var updateBudget = function(){
    
        // 1. Calculate the Budget
               budgetCtrl.calculateBudget();   //  all calculation of inc or exp is there;
        // 2. return the budget
               var budget = budgetCtrl.getBudget();    // getting the value of budget,total inc or total exp
        // 3. Display the budget on the UI.
             UICtrl.displayBudget(budget);             // method to show on the UI

   };

var updatePercentages = function(){
    
     // 1. Calculate the percentages
            budgetCtrl.calculatePercentages();

     //2. Read percentages from the budget Controller
        var percentages = budgetCtrl.getPercentage();

    // 3. Update the UI with the new percentage
          UICtrl.displayPercentages(percentages);

};

   var ctrlAddItems = function(){
     // all varible declaration
       var input, newItem;

     // 1. Get the field input data
        input =  UICtrl.getInput();           // getting the desc and value from user
                                             
      if(input.description !== "" && !isNaN(input.value) && input.value > 0)    
      {
          // 2. Add items to the budget controller
          newItem =   budgetCtrl.addItem(input.type, input.description,input.value);    //for storing value in data structure

         
        // 3. Add the items to the UI.
             UICtrl.addlistItem(newItem, input.type);        //for showing the value that are stored in data structure

         // 4. clear the field
              UICtrl.clearFields();                        // for clearing th fields of desc or exp
         
        // 5. calculate and update the budget
              updateBudget();     
              
        // 6. Calculate and Update the percenages
              updatePercentages();
      }  
   };

   var ctrlDeleteItems = function (event){
      var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;   // to select the ID using event delegation eg : inc -1

    if(itemID){               // return 0 if doesn't exist and return 1 and go inside the block if exist itemID
       // inc - 1
     splitID = itemID.split('-');    // split seperate the value in array for eg:: which is shown below
     // splitID = ['inc','1'];

     type = splitID[0];  // type = inc           // to select the inc which is store in index[0] which is inc
     ID = parseInt(splitID[1]);     // id = 1;    // to convert into integer parse int is used

     //1. Delete the item from the  data structure
         budgetCtrl.deleteItems(type, ID);            

     //2. Delete the item from the UI
           UICtrl.deleteListItem(itemID);
     //3. Update and show the new budget
         updateBudget();

     // 4.calculate and update the percentages
        updatePercentages()
    }  
   

   };

   return {
      init: function() {
     
         UICtrl.displayBudget({
            budget: 0,
            totalInc : 0,
            totalExp : 0,
            percentage: -1
         });
         setupEventListener();
         UICtrl.displayMonth();
       
      }

   };


})(budgetController,UIController);

controller.init();

