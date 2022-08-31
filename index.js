const inquirer = require("inquirer")
const db = require("./config/connection")

require("console.table")



db.connect(() => {
    menu()
})


const menuQuestions = [
    {
        type: "list",
        name: "menu",
        message: "Choose the following option",
        choices: ["view all departments", "view all roles", "view all employees", "add a department", "update an employee role"]
    }
]

function menu() {
    inquirer.prompt(menuQuestions)
        .then(response => {
            if (response.menu === "view all employess") {
                viewEmployees()
            }
            else if (response.menu === "view all departments") {
                viewDepartments()
            }
            else if (response.menu === "add an employee") {
                addEmployees()
            }
            else if (response.menu === "view all roles") {
                viewRoles()
            }
        })
}
function viewDepartments() {
    db.query(`select* from department`, (err, data) => {
        console.table(data)
        menu()
    })
}

function viewRoles() {
    db.query(`select* from role`, (err, data) => {
        console.table(data)
        menu()
    })
}

function addEmployees() {
    db.query("select title as name, id as value from role", (err, roleData) => {
        db.query(`select CONCAT(first_name, " " , last_name) as name, id as value from employee where manager_id is null`, (err, managerData) => {
            const employeeAddQuestions = [
                {
                    type: "input",
                    name: "first_name",
                    message: "What is your first name?",

                },
                {
                    type: "input",
                    name: "last_name",
                    message: "What is your last name?"
                },
                {
                    type: "list",
                    name: "role_id",
                    message: "Choose the following role title",
                    choices: roleData
                },
                {
                    type: "list",
                    name: "manager_id",
                    message: "Choose the following manager",
                    choices: managerData
                }


            ]
            inquirer.prompt(employeeAddQuestions).then(response => {
                const parameters = [response.first_name, response.last_name, response.role_id, response.manager_id]
                db.query("INSERT INTO employee (first_name,last_name,role_id,manager_id)VALUES(?,?,?,?)", parameters, (err, data) => {
                    viewEmployees()
                })
            })
        })
    })
}

function viewEmployees() {
    db.query(`
    SELECT
    employee.id,
    employee.first_name
    employee.last_name,
    role.title,
    department.name as department,
    role.salary,
    CONCAT(mgr.first_name, " " , mgr.last_name) as manager
    FROM employee
    LEFT JOIN role ON role.id= employee.role_id
    LEFT JOIN department ON role.department_id=department.id
    LEFT JOIN employee as mgr ON employee.manager_id = mgr.id
    `, (err, data) => {
        console.table(data)
        menu()
    })
}