---

# **Appointment Manager**  
by Lukas Reißland  

A simple tool to manage and organize your appointments.

---

## **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/appointment-manager.git
   cd appointment-manager
   ```

2. Install dependencies:

   MongoDB Server:
   https://www.mongodb.com/try/download/community

3. Start the application:
   ```bash
   node app.js
   ```

---

## **Important Notes for Windows Users**
If you encounter issues with `bcrypt`:
1. Delete the `bcrypt` package:
   ```bash
   rm -rf node_modules/bcrypt
   ```
2. Reinstall it:
   ```bash
   npm install bcrypt
   ```

---

## **License**
MIT License  

---
