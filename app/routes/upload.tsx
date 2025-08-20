import { type FormEvent, useState } from "react";
import Navbar from "../components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdfToimage";
import { generateUUID } from "~/lib/utils";

const upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setisProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDiscription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDiscription: string;
    file: File;
  }) => {
    setisProcessing(true);
    setStatusText("uploading the file....");
    const upLoadFile = await fs.upload([file]);

    if (!upLoadFile) return setStatusText("Failed to upload file");

    setStatusText("converting to image...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file) return setStatusText("Failed to convert PDF to image");

    setStatusText("Uploading image...");
    const upLoadImage = await fs.upload([imageFile.file]);
    if (!upLoadImage) return setStatusText("Failed to upload image");
    setStatusText("Preparing data...");

    const uuid = generateUUID();
  };
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("companyName") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobdiscription = formData.get("job-discription") as string;

    if (!file) return;

    handleAnalyze({
      companyName,
      jobTitle,
      jobDiscription: jobdiscription,
      file,
    });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section py-16">
        <div className="page-hading">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-10"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  id="company-name"
                  name="companyName"
                  placeholder="company name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  id="job-title"
                  name="job-title"
                  placeholder="job title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Discription</label>
                <textarea
                  rows={5}
                  id="job-discription"
                  name="job-discription"
                  placeholder="Job Discription"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default upload;
