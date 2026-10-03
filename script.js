const nameInput = document.getElementById("studentName");
const dateInput = document.getElementById("attendanceDate");
const tableBody = document.querySelector("#attendanceTable tbody");


window.onload = () => {
    setTodayDate();
    fetchStudents();
};
function setTodayDate() {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
}

dateInput.addEventListener("change", fetchStudents);

async function fetchStudents() {
    const date = dateInput.value;

    try {
        const res = await fetch(`http://localhost:3000/students?date=${date}`);
        const data = await res.json();

        tableBody.innerHTML = "";

        data.forEach(student => {
            const row = document.createElement("tr");

            row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>
                <span class="${
                    student.status === 'Present' ? 'present' : 
                    student.status === 'Absent' ? 'absent' : ''
                }">
                    ${student.status}
                </span><br>

                <button class="status-btn present-btn"
                    onclick="markAttendance(${student.id}, 'Present')">
                    Present
                </button>

                <button class="status-btn absent-btn"
                    onclick="markAttendance(${student.id}, 'Absent')">
                    Absent
                </button>

                <button class="delete-btn"
                    onclick="deleteStudent(${student.id})">
                    Delete
                </button>
            </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("FETCH ERROR:", err);
    }
}

async function addStudent() {
    const name = nameInput.value.trim();

    if (name === "") {
        alert("Enter student name");
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/students", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        });

        const data = await res.json();
        console.log("Added:", data);

        nameInput.value = "";
        fetchStudents();

    } catch (err) {
        console.error("ADD ERROR:", err);
    }
}


async function markAttendance(student_id, status) {
    const date = dateInput.value;

    try {
        await fetch("http://localhost:3000/attendance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ student_id, date, status })
        });

        fetchStudents();

    } catch (err) {
        console.error("ATTENDANCE ERROR:", err);
    }
}

async function deleteStudent(id) {
    if (!confirm("Delete this student?")) return;

    try {
        await fetch(`http://localhost:3000/students/${id}`, {
            method: "DELETE"
        });

        fetchStudents();

    } catch (err) {
        console.error("DELETE ERROR:", err);
    }
}