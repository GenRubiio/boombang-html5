<?php

namespace App\Tasks\CustomForm;

use Exception;

class ValidateInputsTask
{
    private $request;
    private $inputs;
    private $errorFields;

    public function __construct($request, $inputs)
    {
        $this->request = $request;
        $this->inputs = $inputs;
        $this->errorFields = [];
    }

    public function run()
    {
        $this->validateFields();
        $this->validateInputsWitchOptions();
        return $this->errorFields;
    }

    private function validateInputsWitchOptions()
    {
        $requestInputsKeys = array_keys($this->request->all());
        $inputsWithOptions = $this->inputs->filter(function ($item) {
            return $item['type'] == 'select' || $item['type'] == 'radio' || $item['type'] == 'checkbox';
        });
        foreach ($inputsWithOptions as $input) {
            if (in_array($input['name'], $requestInputsKeys)) {
                $inputOptions = $input['options'];
                $inputValue = $this->request->input($input['name']);
                if (is_array($inputValue)) {
                    foreach ($inputValue as $value) {
                        $validate = false;
                        foreach ($inputOptions as $option) {
                            if ($option['hash'] == $value) {
                                $validate = true;
                            }
                        }
                        if (!$validate) {
                            $this->errorFields[$input['name']] = trans('form.invalid_value');
                        }
                    }
                } else {
                    $validate = false;
                    foreach ($inputOptions as $option) {
                        if ($option['hash'] == $inputValue) {
                            $validate = true;
                        }
                    }
                    if (!$validate) {
                        $this->errorFields[$input['name']] = trans('form.invalid_value');
                    }
                }
            }
        }
    }

    private function validateFields()
    {
        $requestInputsKeys = array_keys($this->request->all());
        foreach ($this->inputs as $input) {
            if (count($input['dependences'])) {
                $inUse = false;
                foreach ($input['dependences'] as $dependence) {
                    $dependenceInput = $this->inputs->where('column_hash', $dependence['input_hash'])->first();
                    foreach ($dependenceInput['options'] as $option) {
                        if ($option['hash'] == $dependence['input_option_hash'] && $option['hash'] == $this->request->input($dependenceInput['name'])) {
                            $inUse = true;
                            break;
                        }
                    }
                    if ($inUse) {
                        break;
                    }
                }
                if ($inUse) {
                    if (!$this->validateByTypes($input)) {
                        continue;
                    }
                    if ($input['required'] && !in_array($input['name'], $requestInputsKeys)) {
                        $this->errorFields[$input['name']] = trans('form.field_required');
                    } elseif ($input['required'] && empty(($this->request[$input['name']]))) {
                        $this->errorFields[$input['name']] = trans('form.field_required');
                    }
                }
            } else {
                if (!$this->validateByTypes($input)) {
                    continue;
                }
                if ($input['required'] && !in_array($input['name'], $requestInputsKeys)) {
                    $this->errorFields[$input['name']] = trans('form.field_required');
                } elseif ($input['required'] && empty(($this->request[$input['name']]))) {
                    $this->errorFields[$input['name']] = trans('form.field_required');
                }
            }
        }
    }

    private function validateByTypes($input)
    {
        try {
            switch ($input['type']) {
                case 'number':
                    if (is_numeric($this->request->input($input['name']))) {
                        return false;
                    } else {
                        $this->errorFields[$input['name']] = trans('form.invalid_value');
                        return false;
                    }
                    break;
                case 'email':
                    if (!filter_var($this->request->input($input['name']), FILTER_VALIDATE_EMAIL)) {
                        $this->errorFields[$input['name']] = trans('form.invalid_value');
                        return false;
                    }
                    break;
                case 'image':
                    if ($this->request->file($input['name'])) {
                        //$maxSize = 200 * 1024;  // 200K en bytes
                        $file = $this->request->file($input['name']);
                        $allowedExtensions = ['jpg', 'jpeg', 'png'];
                        $fileExtension = strtolower(pathinfo($this->request->file($input['name'])->getClientOriginalName(), PATHINFO_EXTENSION));
                        //$fileSize = $file->getSize();

                        if (!in_array($fileExtension, $allowedExtensions)) {
                            $this->errorFields[$input['name']] = trans('form.invalid_image_type');
                            return false;
                        }
                        //if ($fileSize > $maxSize) {
                        //    $this->errorFields[$input['name']] = trans('form.image_too_large');
                        //    return false;
                        //}
                    }
                    break;
                default:
                    return true;
                    break;
            }
        } catch (Exception $e) {
            return false;
        }
        return true;
    }
}
