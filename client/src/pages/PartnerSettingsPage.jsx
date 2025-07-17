import React, { useState, useEffect } from "react";

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const dayLabels = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
  sunday: "Minggu",
};

const PartnerSettingsPage = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fungsi untuk mengambil data jadwal awal
  useEffect(() => {
    const fetchSchedule = async () => {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch("/api/partner/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Gagal mengambil data jadwal.");
        // Inisialisasi jadwal jika data dari server kosong
        const initialSchedule = {};
        daysOfWeek.forEach((day) => {
          initialSchedule[day] = data[day] || {
            isOpen: true,
            opens: "09:00",
            closes: "21:00",
          };
        });
        setSchedule(initialSchedule);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  // Fungsi untuk menangani perubahan pada form
  const handleScheduleChange = (day, field, value) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: {
        ...prevSchedule[day],
        [field]: value,
      },
    }));
  };

  // Fungsi untuk menyimpan perubahan
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setIsSaving(true);
    try {
      const response = await fetch("/api/partner/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ schedule }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Gagal menyimpan perubahan.");
      alert("Jadwal berhasil disimpan!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-4">Memuat pengaturan jadwal...</div>;
  if (error) return <div className="p-4 text-danger">Error: {error}</div>;

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center m-4">
        <h2 className="fs-2 mb-0">Pengaturan Jadwal & Jam Operasional</h2>
      </div>

      <div className="table-card p-4 shadow-sm">
        <form onSubmit={handleSaveChanges}>
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="row align-items-center mb-3 pb-3 border-bottom"
            >
              <div className="col-md-2">
                <strong className="text-capitalize">{dayLabels[day]}</strong>
              </div>
              <div className="col-md-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id={`isOpen-${day}`}
                    checked={schedule[day]?.isOpen || false}
                    onChange={(e) =>
                      handleScheduleChange(day, "isOpen", e.target.checked)
                    }
                  />
                  <label className="form-check-label" htmlFor={`isOpen-${day}`}>
                    {schedule[day]?.isOpen ? "Buka" : "Tutup"}
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="time"
                    className="form-control"
                    aria-label="Jam Buka"
                    value={schedule[day]?.opens || ""}
                    onChange={(e) =>
                      handleScheduleChange(day, "opens", e.target.value)
                    }
                    disabled={!schedule[day]?.isOpen}
                  />
                  <span className="input-group-text">-</span>
                  <input
                    type="time"
                    className="form-control"
                    aria-label="Jam Tutup"
                    value={schedule[day]?.closes || ""}
                    onChange={(e) =>
                      handleScheduleChange(day, "closes", e.target.value)
                    }
                    disabled={!schedule[day]?.isOpen}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="text-end mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan Jadwal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerSettingsPage;
