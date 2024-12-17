import tkinter as tk
from tkinter import ttk
from Task import Task


class GUI:
    def __init__(self):
        self.taskList = []

        self.root = tk.Tk()
        self.root.geometry("650x450")
        self.root.configure(bg="#f0f8ff") 
        self.root.title("ToDo List")

        self.root.tk.call('source', 'forest-dark.tcl')
        ttk.Style().theme_use('forest-dark')

        self.task_entry = ttk.Entry(self.root, width=40, font=("Arial", 14))
        self.task_entry.grid(row=0, column=0, columnspan=4, padx=10, pady=10, sticky="ew")

        self.button_frame = tk.Frame(self.root, bg="#f0f8ff")
        self.button_frame.grid(row=1, column=0, columnspan=4, padx=10, pady=10)

        self.add_button = ttk.Button(self.button_frame, text="Add Task", command=self.add_task)
        self.add_button.grid(row=0, column=0, padx=5, pady=5, sticky="ew")

        self.delete_button = ttk.Button(self.button_frame, text="Delete Task", command=self.delete_task)
        self.delete_button.grid(row=0, column=1, padx=5, pady=5, sticky="ew")

        self.mark_done_button = ttk.Button(self.button_frame, text="Mark Done", command=self.mark_task_done)
        self.mark_done_button.grid(row=0, column=2, padx=5, pady=5, sticky="ew")

        self.task_listbox = tk.Listbox(self.root, width=70, height=15, font=("Arial", 12))
        self.task_listbox.grid(row=2, column=0, columnspan=4, padx=10, pady=10)

        for col in range(4):
            self.root.grid_columnconfigure(col, weight=1, uniform="equal")

        self.read_todos()

        self.root.mainloop()

    def add_task(self):
        task_title = self.task_entry.get()
        if task_title.strip():
            new_task = Task(len(self.taskList), "[WIP]", task_title)
            self.taskList.append(new_task)
            self.task_listbox.insert(tk.END, new_task.toText())
            self.task_entry.delete(0, tk.END)
            print(f"Added Task: {new_task.toText()}")
            self.save_todos()

    def delete_task(self):
        selected_index = self.task_listbox.curselection()
        if selected_index:
            self.task_listbox.delete(selected_index)
            del self.taskList[selected_index[0]]
            self.save_todos()

    def mark_task_done(self):
        selected_index = self.task_listbox.curselection()
        if selected_index:
            task = self.taskList[selected_index[0]]
            task.setStatus("[DONE]")
            self.task_listbox.delete(selected_index)
            self.task_listbox.insert(tk.END, task.toText())
            self.save_todos()

    def save_todos(self):
        f = open("text.txt", "w")
        for task in self.taskList:
            f.write(task.toString())
        f.close

    def read_todos(self):
        self.task_listbox.delete(0, len(self.taskList))
        f = open("text.txt", "r")
        string = f.read()
        stringList = string.split("|")
        for x in range(0, len(stringList)-1):
            str = stringList[x]
            splitTask = str.split("/")
            print(splitTask)
            taskID = int(splitTask[1])
            taskStatus = splitTask[2]
            taskTile = splitTask[3]
            newTask = Task(taskID, taskStatus, taskTile)
            self.taskList.append(newTask)
            self.task_listbox.insert(tk.END, newTask.toText())

if __name__ == "__main__":
    GUI()
