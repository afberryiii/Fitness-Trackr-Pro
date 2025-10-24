import { useState, useEffect } from "react";
import { deleteActivity, getActivity } from "../api/activities";
import { useAuth } from "../auth/AuthContext";
import { useParams, useNavigate, Link } from "react-router";

export default function ActivityDetails({ syncActivities }) {
  const { activityId } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    if (!activityId) {
      setLoading(false);
      setError("No activity ID provided.");
      return;
    }

    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getActivity(activityId);
        setActivity(data);
      } catch (e) {
        console.error("Failed to fetch activity:", e);
        setError("Could not load activity details. " + e.message);
        setActivity(null);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activityId]);

  const tryDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${
          activity?.name || "this activity"
        }"? This cannot be undone.`
      )
    ) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await deleteActivity(token, activityId);

      if (syncActivities) {
        syncActivities();
      }

      navigate("/activities");
    } catch (e) {
      setError(e.message || "Failed to delete activity.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading activity details...</p>;
  }

  if (!activity || error) {
    return (
      <p role="alert" style={{ color: "red" }}>
        Error: {error || "Activity not found."}
      </p>
    );
  }

  console.log(activity);
  return (
    <div>
      <h1>{activity.name}</h1>
      <p>{activity.description || "No description available."}</p>
      <p>{activity.creatorName}</p>
      <hr />

      {token && (
        <>
          <button
            onClick={tryDelete}
            disabled={loading}
            style={{
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "10px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Deleting..." : "Delete Activity"}
          </button>
          {error && (
            <p role="alert" style={{ color: "red", marginTop: "10px" }}>
              Delete Error: {error}
            </p>
          )}
        </>
      )}

      <p style={{ marginTop: "20px" }}>
        <Link to="/activities">← Back to Activities List</Link>
      </p>
    </div>
  );
}
