document.addEventListener("DOMContentLoaded" , () => {
      // Load API key if it exists
      chrome.storage.sync.get(["geminiApiKey"] , (result) =>{
        if(result.geminiApiKey){
            document.getElementById("api-key").value = result.geminiApiKey ;
        } 
      }) ;


      // saves Api key when save button is clicked.
      document.getElementById("save-button").addEventListener("click" , () =>{
       
        const apiKey = document.getElementById("api-key").value.trim();
        
        if(apiKey){
          chrome.storage.sync.set({geminiApiKey : apiKey} , () => {
              const successMessage = document.getElementById("success-message");
              successMessage.style.display = "block" ;
          
            // close tab after some delay to show success message
            setTimeout(()=>{
               window.close();
               chrome.tabs.getCurrent((tab) => {

                if(tab){
                  chrome.tabs.remove(tab.id);
                }
               });
            } , 1000) ;             

          });
        }
      });
});