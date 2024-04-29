import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http.js";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", { id }],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleDelete() {
    setDeleteLoader(true);
    mutate({ id });
  }

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching event data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Error fetching event"
          message={error.info?.message || "Error fetching event."}
        />
      </div>
    );
  }

  if (data) {
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          {!deleteLoader && (
            <>
              <h2>Are you sure?</h2>
              <p>
                Do you really want ot delete this event? This action cannot be
                undone.
              </p>
              <div className="form-actions">
                <button onClick={handleStopDelete} className="button-text">
                  Cancel
                </button>
                <button onClick={handleDelete} className="button">
                  Delete
                </button>
              </div>{" "}
            </>
          )}
          {deleteLoader && (
            <>
              <LoadingIndicator /> <p>Deleting...</p>
            </>
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
