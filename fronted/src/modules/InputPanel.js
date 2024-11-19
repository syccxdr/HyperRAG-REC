import React from "react";
import { styled } from "@mui/joy/styles";
import { useDropzone } from "react-dropzone";
import Textarea from "@mui/joy/Textarea";
import Box from "@mui/joy/Box";
import Chip from "@mui/joy/Chip"
import ChipDelete from "@mui/joy/ChipDelete";
import Button from "@mui/joy/Button";
import IconButton from "@mui/joy/IconButton";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { sendPrompts } from "../interface/api";

const Division = styled('div')(({ theme }) => ({
  padding: theme.spacing(1, 2, 2, 2),
  display: "flex",
  flexDirection: "column"
}));

const WrapTextarea = styled(Textarea)(({ theme }) => ({
  "& .MuiTextarea-startDecorator": {
    padding: theme.spacing(0.25, 0.5, 0)
  }
}));

const Span = styled('div')(({ theme }) => ({
  flexGrow: 1
}));

// 全局变量：语音识别实例
let recognition = null;

function InputPanel(props) {
  const {
    sessionList = [],
    setSessionList
  } = props

  const [prompts, setPrompts] = React.useState("");
  const [savedPrompts, setSavedPrompts] = React.useState({ prompts: "", file: null });
  const [dropFile, setDropFile] = React.useState(null);
  const [promptsDisabled, setPromptsDisabled] = React.useState(false);
  const [sendButtonLoading, setSendButtonLoading] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false); // 语音识别状态
  const [isUserStopped, setIsUserStopped] = React.useState(false); // 是否是用户主动停止

  // 初始化语音识别
  React.useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      alert("当前浏览器不支持语音识别功能");
      return;
    }
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "zh-CN"; // 设置语言为中文
    recognition.interimResults = false; // 只返回最终结果

    recognition.onstart = () => {
      console.log("语音识别已启动...");
      setIsListening(true); // 设置状态为正在监听
      setIsUserStopped(false); // 重置用户主动停止状态
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("语音识别结果:", transcript);
      setPrompts((prevPrompts) => prevPrompts + transcript); // 将语音识别结果追加到输入框
    };

    recognition.onerror = (event) => {
      console.error("语音识别错误:", event.error);
      if (event.error !== "aborted") {
        alert(`语音识别出错: ${event.error}`);
      }
      setIsListening(false); // 停止监听状态
    };

    recognition.onend = () => {
      console.log("语音识别结束");
      setIsListening(false);
      if (!isUserStopped) {
        console.log("语音识别自然结束");
      }
    };
  }, [isUserStopped]);

  // 点击麦克风按钮触发语音识别
  const handleVoiceInput = React.useCallback(() => {
    if (!recognition) {
      alert("语音识别未初始化");
      return;
    }

    if (isListening) {
      // 用户主动停止语音识别
      setIsUserStopped(true);
      recognition.stop(); // 停止语音识别
    } else {
      recognition.start(); // 启动语音识别
    }
  }, [isListening]);

  const handleAddStep = React.useCallback((fingerprint) => {
    setSessionList((sessionList) => {
      return [
        ...sessionList,
        {
          type: "Step",
          fingerprint: fingerprint,
          config: []
        }
      ];
    });
  }, [setSessionList]);

  const handleStepNew = React.useCallback((fingerprint, title) => {
    setSessionList((sessionList) => sessionList.map((item) =>
        item.fingerprint === fingerprint
            ? { ...item, config: [ ...item.config, { title: title, result: null } ] }
            : item
    ));
  }, [setSessionList]);

  const handleStepFin = React.useCallback((fingerprint, result) => {
    if (/\s*/.test(result)) {
      return;
    }
    setSessionList((sessionList) => sessionList.map((item) =>
        item.fingerprint === fingerprint
            ? {
              ...item,
              config: item.config.slice(0, -1).concat([{
                title: item.config.slice(-1)[0].title,
                result: result
              }])
            } : item
    ));
  }, [setSessionList]);

  const handleAddBubble = React.useCallback((fromUser, content, attached) => {
    setSessionList((sessionList) => [
      ...sessionList,
      {
        type: "Bubble",
        fromUser: fromUser,
        content: content,
        attached: attached
      }
    ])
  }, [setSessionList]);

  const handleAddBanner = React.useCallback((color, content) => {
    setSessionList((sessionList) => [
      ...sessionList,
      {
        type: "Banner",
        color: color,
        content: content
      }
    ])
  }, [setSessionList])

  const handleClickSend = React.useCallback(() => {
    setSendButtonLoading(true);
    setPromptsDisabled(true);

    setPrompts((prompts) => {
      setSavedPrompts({
        prompts: prompts,
        file: dropFile?.path
      });
      return "";
    })
  }, [dropFile])

  React.useEffect(() => {
    if (savedPrompts.prompts.length === 0) {
      return;
    }

    setDropFile(null);
    const filename = savedPrompts.file
        ? window.require
            ? window.require("path").basename(savedPrompts.file)
            : savedPrompts.file.split("/").slice(-1)[0]
        : null;
    handleAddBubble(true, savedPrompts.prompts, filename)
    sendPrompts(savedPrompts.prompts, savedPrompts.file, {
      handleAddBubble: handleAddBubble,
      handleAddStep: handleAddStep,
      handleStepNew: handleStepNew,
      handleStepFin: handleStepFin
    })
        .then((_) => {
          handleAddBanner("success", "Current task execution completed.");
        })
        .catch((err) => {
          console.error(err);
          err && handleAddBanner("danger", err.info ? err.info : err.toString());
        })
        .finally(() => {
          setPromptsDisabled(false);
          setSendButtonLoading(false);
          setSavedPrompts({ prompts: "", file: null });
        })
    // WARNING: savedPrompts ONLY changed in handleClickSend()
    // eslint-disable-next-line
  }, [savedPrompts]);

  const onDrop = React.useCallback((acceptedFiles) => {
    if (promptsDisabled) {
      return;
    }
    setDropFile(acceptedFiles[0]);
  }, [promptsDisabled])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: onDrop
  })

  return (
      <Division>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <WrapTextarea
              color="neutral"
              minRows={4}
              maxRows={4}
              sx={{
                backgroundColor: isDragActive
                    ? "var(--joy-palette-neutral-300)"
                    : "var(--joy-palette-neutral-100)"
              }}
              placeholder={promptsDisabled ? "" : "Send a message"}
              size="md"
              variant="soft"
              disabled={promptsDisabled}
              value={prompts}
              onChange={(event) => setPrompts(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.shiftKey) {
                  event.preventDefault(); // 阻止默认行为
                  if (prompts.trim().length > 0) {
                    handleClickSend(); // 调用发送逻辑
                  }
                }
              }}
              startDecorator={dropFile &&
                  <Chip
                      color="primary"
                      sx={{
                        "--Chip-radius": "0px",
                        minWidth: "100%",
                        padding: 0.5,
                        "& .MuiChip-label": {
                          display: "flex",
                          alignItems: "center"
                        }
                      }}
                      endDecorator={
                        <ChipDelete
                            sx={{ marginRight: 0.5 }}
                            onDelete={() => setDropFile(null)}
                        />
                      }
                  >
                    <UploadFileOutlinedIcon sx={{ marginRight: 0.5 }} />
                    {dropFile.name}
                  </Chip>
              }
              endDecorator={
                <Box
                    sx={{
                      display: 'flex',
                      gap: 'var(--Textarea-paddingBlock)',
                      pt: 'var(--Textarea-paddingBlock)',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      flex: 'auto',
                    }}
                >
                  <IconButton
                      // 垃圾桶🚮图标
                      disabled={sessionList.length === 0}
                      variant="soft"
                      sx={{
                        backgroundColor: sessionList.length === 0
                            ? "rgb(240, 244, 248) !important"
                            : undefined
                      }}
                  >
                    <DeleteOutlineIcon
                        onClick={() => { setSessionList([]) }}
                    />
                  </IconButton>
                  <IconButton
                      // 麦克风🎤图标
                      variant="soft"
                      onClick={handleVoiceInput}
                      sx={{
                        backgroundColor: isListening ? "#0A6BCB" : "#EFF3F7", // 默认状态与启动状态颜色
                        color: isListening ? "white" : "inherit", // 启动时字体为白色
                        '&:hover': {
                          backgroundColor: isListening ? "#0288d1" : "var(--joy-palette-neutral-400)", // 悬停状态动态颜色
                        },
                      }}
                  >
                    🎤
                  </IconButton>
                  <Span />
                  <Button
                      disabled={prompts.length === 0}
                      loading={sendButtonLoading}
                      loadingPosition="end"
                      endDecorator={<SendIcon />}
                      variant="solid"
                      children="SEND"
                      onClick={handleClickSend}
                  />
                </Box>
              }
          />
        </div>
      </Division>
  );
}

export default InputPanel;