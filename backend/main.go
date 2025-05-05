package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"syscall"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"golang.org/x/net/websocket"
)

type LoginResponse struct {
	Username string `json:"username"`
	Token    string `json:"token"`
}

type Quest struct {
	Type        string     `json:"type"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Duration    int        `json:"duration"`
	Id          int        `json:"id"`
	User        *string    `json:"user"`
	Status      *string    `json:"status"`
	EndTime     *time.Time `json:"end_time"`
}

type Api struct {
	db     *sql.DB
	update map[string]chan int
}

func (a Api) authorizeUser(token string) (username string) {
	row := a.db.QueryRow("SELECT user FROM tokens WHERE value = ?", token)
	row.Scan(&username)
	return
}

func (a Api) getQuests(user string) ([]Quest, error) {
	noQuests := make([]Quest, 0)
	rows, err := a.db.Query("SELECT * FROM quests WHERE user = ?", user)
	if err != nil {
		return noQuests, err
	}
	qs := make([]Quest, 0)
	for rows.Next() {
		q := Quest{}
		if err := rows.Scan(&q.Id, &q.User, &q.Type, &q.Title, &q.Description, &q.Duration, &q.Status, &q.EndTime); err != nil {
			return noQuests, err
		}
		qs = append(qs, q)
	}
	return qs, nil
}

func (a Api) quests(user string) websocket.Handler {
	return websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()
		log.Println("Connection to /api/quests estabilished.")
		a.update[user] <- 1
		select {
		case <-a.update[user]:
			qs, err := a.getQuests(user)
			if err != nil {
				log.Println(err.Error())
				log.Printf("Couldn't get quest list for user \"%s\". Most likely the token has expired.", user)
				ws.Close()
			}
			j, err := json.Marshal(qs)
			if err != nil {
				log.Printf("Couldn't marshall quest list into JSON for user \"%s\".", user)
				ws.Close()
			}

			if _, err := ws.Write(j); err != nil {
				if errors.Is(err, syscall.EPIPE) {
					log.Println("Broken connection with client.")
					ws.Close()
					return
				} else {
					log.Fatal(err)
				}
			}
		}
	})
}

func (a Api) Quests() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("token")
		if err != nil {
			log.Println("Cookie with token not found in request.")
			http.Error(w, "Unauthorized: Missing auth token", http.StatusUnauthorized)
			return
		}

		user := a.authorizeUser(cookie.Value)
		if user == "" {
			log.Println("Invalid auth token.")
			http.Error(w, "Unauthorized: The provided token is invalid.", http.StatusUnauthorized)
			return
		}

		a.quests(user).ServeHTTP(w, r)
	})
}

func (a Api) Login() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseMultipartForm(10000); err != nil {
			log.Println("Error during form parse.")
			http.Error(w, "Unauthorized: Provided login form is malformed.", http.StatusUnauthorized)
		}
		username := r.PostForm.Get("email")
		password := r.PostForm.Get("password")
		if username == "" || password == "" {
			log.Println("Not all needed login data present.")
			http.Error(w, "Unauthorized: Didn't provide all necessary login data.", http.StatusUnauthorized)
			return
		}
		row := a.db.QueryRow("SELECT 1 FROM users WHERE email = ? AND password = SHA2(?, 256)", username, password)
		if err := row.Scan(new(int)); err != nil {
			log.Println("No user found for the provided login data.", err.Error())
			http.Error(w, "Unauthorized: Provided login data is invalid.", http.StatusUnauthorized)
			return
		}

		token := uuid.New().String()
		if _, err := a.db.Exec("INSERT INTO tokens VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 DAY))", username, token); err != nil {
			log.Println("Error during token creation.")
			http.Error(w, "Unauthorized: Error during token creation.", http.StatusUnauthorized)
			return
		}
		body, err := json.Marshal(LoginResponse{username, token})
		if err != nil {
			log.Fatal("Error during json.Marshall on LoginResponse.")
		}
		a.update[username] = make(chan int, 1)
		w.Write(body)
	})
}

func (a Api) getQuestData(w http.ResponseWriter, r *http.Request) (Quest, string) {
	if err := r.ParseMultipartForm(10000); err != nil {
		log.Println("Error during form parse.")
		http.Error(w, "Encountered an error while trying to parse provided form.", http.StatusInternalServerError)
		return Quest{}, ""
	}
	duration, _ := strconv.Atoi(r.PostForm.Get("time"))
	id, _ := strconv.Atoi(r.PostForm.Get("id"))
	q := Quest{
		r.PostForm.Get("type"),
		r.PostForm.Get("title"),
		r.PostForm.Get("description"),
		duration,
		id,
		nil,
		nil,
		nil,
	}
	user := a.authorizeUser(r.PostForm.Get("token"))
	if user == "" {
		log.Println("Invalid auth token.")
		http.Error(w, "Unauthorized: The provided token is invalid.", http.StatusUnauthorized)
		return Quest{}, ""
	}
	return q, user
}

func (a Api) NewQuest() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q, user := a.getQuestData(w, r)
		if q == (Quest{}) {
			return
		}
		log.Println(q.Id)
		if _, err := a.db.Exec("INSERT INTO quests (user, type, title, description, duration) VALUES (?, ?, ?, ?, ?)", user, q.Type, q.Title, q.Description, q.Duration); err != nil {
			msg := "Couldn't insert quest data into DB."
			log.Println(msg, err)
			http.Error(w, msg, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(200)
		a.update[user] <- 1 // Channel here could potentially end up being nil but for the sake of simplicity we'll let it raise a panic.
	})
}

func (a Api) UpdateQuest() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q, user := a.getQuestData(w, r)
		if q == (Quest{}) {
			return
		}
		if _, err := a.db.Exec("UPDATE quests SET type = ?, title = ?, description = ?, duration = ? WHERE id = ?", q.Type, q.Title, q.Description, q.Duration, q.Id); err != nil {
			msg := "Couldn't modify quest data."
			log.Println(msg, err)
			http.Error(w, msg, http.StatusInternalServerError)
			return
		}
		w.WriteHeader(200)
		a.update[user] <- 1 // Channel here could potentially end up being nil but for the sake of simplicity we'll let it raise a panic.
	})
}

func main() {
	cfg := mysql.NewConfig()
	cfg.User = os.Getenv("DBUSER")
	cfg.Passwd = os.Getenv("DBPASS")
	cfg.Addr = "127.0.0.1:3306"
	cfg.DBName = "quests"
	cfg.ParseTime = true

	db, err := sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		log.Fatal(err)
	}

	api := Api{db, make(map[string]chan int)}

	pingErr := db.Ping()
	if pingErr != nil {
		log.Fatal(pingErr)
	}
	log.Print("Connected to database.")

	mx := http.NewServeMux()
	mx.Handle("GET /api/quests", api.Quests())
	mx.Handle("POST /api/quests", api.NewQuest())
	mx.Handle("PATCH /api/quests", api.UpdateQuest())
	mx.Handle("POST /api/login", api.Login())

	srv := &http.Server{
		Addr:    "0.0.0.0:3333",
		Handler: mx,
	}

	if err := srv.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
