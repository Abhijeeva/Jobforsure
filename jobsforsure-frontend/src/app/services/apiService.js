export const submitProfile = async (file, jobDescription, submissionDate) => {
  const formData = new FormData();
  formData.append("pdf_file", file);
  formData.append("job_description", jobDescription);
  formData.append("submission_date", submissionDate);

  try {
    const response = await fetch("http://127.0.0.1:8000/submitProfile", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to submit profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error submitting profile:", error);
    throw error;
  }
};
