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
        choices: ["view all departments", "view all roles", "view all employees", "add a department", "add a role", "add an employee", "update an employee role"]
    }
]

function menu() {
    inquirer.prompt(menuQuestions)
        .then(response => {

            if (response.menu === "view all departments") {
                viewDepartments()
            }
            else if (response.menu === "view all roles") {
                viewRoles()
            }
            else if (response.menu === "view all employees") {
                viewEmployees()
            }
            else if (response.menu === "add a department") {
                addDepartment()
            }
            else if (response.menu === "add a role") {
                addRoles()
            }
            else if (response.menu === "add an employee") {
                addEmployees()
            }
            else if (response.menu === "update an employee role") {
                updateEmployeeRole()
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
    db.query(`
    select role.id, title, salary, department.name from role
    JOIN department on department_id = department.id
    `, (err, data) => {
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
    employee.first_name,
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
        // console.error(err)
        console.table(data)
        menu()
    })
}

function addDepartment() {


    const addDepartmentQuestion = [
        {
            type: "input",
            name: "department_name",
            message: "What is the name of the department?"

        }

    ]
    inquirer.prompt(addDepartmentQuestion).then(response => {
        const parameters = [response.department_name]
        db.query("INSERT INTO department (name)VALUES(?)", parameters, (err, data) => {
            viewDepartments()
        })







    })

}

function addRoles() {

    db.query(`select id as value, name as name from department`, (err, departmentData) => {

        const addRoleQuestions = [
            {
                type: "input",
                name: "role_name",
                message: "What is the name of the role?"

            },
            {
                type: "input",
                name: "salary",
                message: "What is this role's salary?"
            },
            {
                type: "list",
                name: "department_name",
                choices: departmentData
            }



        ]
        inquirer.prompt(addRoleQuestions).then(response => {
            const parameters = [response.role_name, response.salary, response.department_name]
            db.query("INSERT INTO role (title, salary, department_id)VALUES(?,?,?)", parameters, (err, data) => {
                viewRoles()
            })







        })

    })

}

function updateEmployeeRole() {


    db.query(`
    SELECT
    employee.id as value,
    CONCAT(employee.first_name, " " , employee.last_name) as name
    FROM employee
    `, (err, employeeData) => {
        // console.error(err)
        db.query("select id as value, title as name from role", (err, roleData) => {
            const updateRole = [
                {
                    type: "list",
                    name: "employees",
                    message: "Which employee would you like to update?",
                    choices: employeeData
    
    
                     
    
                },
                {
                    type: "list",
                    name: "role",
                    message: "What is the new role?",
                    choices: roleData
                }
    
            ]
    
            
    
            inquirer.prompt(updateRole).then(response => {
                const parameters = []
                console.log(response)
                db.query("update employee set role_id = ? where id = ?", [response.role, response.employees], (err, data) => {
                    viewEmployees()
                })
            })
        })
        
        
    })

    


    
}